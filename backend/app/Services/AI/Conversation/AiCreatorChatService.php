<?php

namespace App\Services\AI\Conversation;

use App\Enums\Ai\AiConversationStatusEnum;
use App\Enums\Ai\AiConversationStepEnum;
use App\Exceptions\http\BadRequestException;
use App\Exceptions\http\NotFoundException;
use App\Exceptions\http\UnprocessableException;
use App\Jobs\AI\GenerateAiCreatorContentJob;
use App\Models\AiCreatorConversation;
use App\Repositories\AiCreatorConversationRepository;
use App\Services\AI\AiPromptBuilderService;
use App\Services\AI\GeminiAiService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AiCreatorChatService
{
    private const CACHE_TTL_SECONDS = 3600;

    public function __construct(
        private readonly AiCreatorConversationRepository   $repository,
        private readonly AiCreatorConversationFlowService  $flow,
        private readonly GeminiAiService                   $gemini,
        private readonly AiPromptBuilderService            $promptBuilder,
    ) {}

    public function startConversation(int $userId, ?string $initialPrompt = null): AiCreatorConversation
    {
        $firstStep = AiConversationStepEnum::sequence()[0];
        $prompt    = $this->flow->getStepPrompt($firstStep);

        // Pre-populate the topic answer when an initial prompt is provided
        $answers = $initialPrompt ? [$firstStep->value => $initialPrompt] : [];

        // Determine first question: skip topic step if initial prompt provided
        $nextStep    = $initialPrompt ? $firstStep->next() : null;
        $activeStep  = $nextStep ?? $firstStep;
        $activePrompt = $this->flow->getStepPrompt($activeStep);

        /** @var AiCreatorConversation */
        return $this->repository->create([
            'uuid'            => (string) Str::uuid(),
            'user_id'         => $userId,
            'initial_prompt'  => $initialPrompt,
            'status'          => AiConversationStatusEnum::WAITING_FOR_ANSWER,
            'current_step'    => $activeStep,
            'answers'         => $answers,
            'last_ai_message' => $activePrompt['question'],
            'options'         => $activePrompt['options'],
        ]);
    }

    public function answerStep(AiCreatorConversation $conversation, string $answer): AiCreatorConversation
    {
        if ($conversation->status !== AiConversationStatusEnum::WAITING_FOR_ANSWER) {
            throw new BadRequestException('Conversation is not waiting for an answer.');
        }

        $currentStep = $conversation->current_step;
        $answers     = array_merge($conversation->answers ?? [], [
            $currentStep->value => trim($answer),
        ]);

        $nextStep = $this->flow->nextStep($currentStep);

        if ($nextStep === null) {
            // All steps done — ready to generate
            $updated = $this->repository->update($conversation->id, [
                'answers'         => $answers,
                'current_step'    => $currentStep,
                'last_ai_message' => 'Tất cả câu hỏi đã hoàn thành. Nhấn "Tạo nội dung" để AI tạo gợi ý cho bạn!',
                'options'         => null,
            ]);
        } else {
            $prompt  = $this->flow->getStepPrompt($nextStep);
            $updated = $this->repository->update($conversation->id, [
                'answers'         => $answers,
                'current_step'    => $nextStep,
                'last_ai_message' => $prompt['question'],
                'options'         => $prompt['options'],
            ]);
        }

        /** @var AiCreatorConversation */
        return $updated;
    }

    public function skipStep(AiCreatorConversation $conversation): AiCreatorConversation
    {
        $currentStep = $conversation->current_step;

        if (! $currentStep->isOptional()) {
            throw new BadRequestException("Step '{$currentStep->value}' cannot be skipped.");
        }

        return $this->answerStep($conversation, '');
    }

    /** Dispatch async generation job. Returns immediately. */
    public function dispatchGenerate(AiCreatorConversation $conversation): AiCreatorConversation
    {
        if (! $this->flow->isReadyToGenerate($conversation->answers ?? [])) {
            throw new BadRequestException('Not all required questions have been answered yet.');
        }

        // Block both terminal states AND the in-flight generating state to prevent duplicate jobs
        if ($conversation->status->isTerminal() || $conversation->status === AiConversationStatusEnum::GENERATING) {
            throw new BadRequestException('Conversation is already completed, failed, or currently generating.');
        }

        $updated = $this->repository->update($conversation->id, [
            'status' => AiConversationStatusEnum::GENERATING,
        ]);

        GenerateAiCreatorContentJob::dispatch($conversation->id);

        /** @var AiCreatorConversation */
        return $updated;
    }

    /** Called by the job — runs the actual Gemini generation. */
    public function generateContent(AiCreatorConversation $conversation): void
    {
        try {
            $answers         = $conversation->answers ?? [];
            $creatorLanguage = 'vi';

            $systemPrompt = $this->promptBuilder->creatorChatSystem();
            $userPrompt   = $this->promptBuilder->creatorChatUser($answers, $creatorLanguage, $conversation->initial_prompt);

            $result = $this->gemini->generateJson($systemPrompt, $userPrompt, [
                'short_caption', 'professional_caption', 'viral_caption', 'hashtags',
            ]);

            $data      = $result['data'];
            $hashtags  = array_values(array_filter(array_map(
                fn ($h) => str_starts_with((string) $h, '#') ? (string) $h : "#{$h}",
                (array) ($data['hashtags'] ?? [])
            )));

            $generatedResult = [
                'short_caption'        => (string) ($data['short_caption']        ?? ''),
                'professional_caption' => (string) ($data['professional_caption'] ?? ''),
                'viral_caption'        => (string) ($data['viral_caption']        ?? ''),
                'hashtags'             => array_slice($hashtags, 0, 10),
                'topic'                => (string) ($data['topic']                ?? ''),
                'content_intent'       => (string) ($data['content_intent']       ?? 'other'),
                'target_audience'      => (string) ($data['target_audience']      ?? ''),
                'hook'                 => $data['hook'] ?? null,
                'confidence_score'     => (float) max(0, min(1, $data['confidence_score'] ?? 0.5)),
            ];

            $this->repository->update($conversation->id, [
                'status'           => AiConversationStatusEnum::COMPLETED,
                'generated_result' => $generatedResult,
                'token_usage'      => $result['token_usage'],
                'completed_at'     => now(),
                'error_message'    => null,
            ]);

            Cache::put($this->cacheKey($conversation->uuid), $generatedResult, self::CACHE_TTL_SECONDS);

        } catch (\Throwable $e) {
            $this->repository->update($conversation->id, [
                'status'        => AiConversationStatusEnum::FAILED,
                'error_message' => mb_substr($e->getMessage(), 0, 500),
                'completed_at'  => now(),
            ]);
        }
    }

    public function findByUuidForUser(string $uuid, int $userId): AiCreatorConversation
    {
        return $this->repository->findByUuidAndUserOrFail($uuid, $userId);
    }

    private function cacheKey(string $uuid): string
    {
        return "ai:creator-chat:result:{$uuid}";
    }
}