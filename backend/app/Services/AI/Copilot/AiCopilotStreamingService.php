<?php

namespace App\Services\AI\Copilot;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Enums\Ai\AiCopilotMessageRoleEnum;
use App\Models\AiCopilotMessage;
use App\Models\AiCopilotSession;
use App\Models\AiPromptTemplate;
use App\Models\AiStudioSetting;
use App\Repositories\AiCopilotMessageRepository;
use App\Repositories\AiPromptTemplateRepository;
use App\Services\AI\Copilot\Handlers\AbstractCopilotHandler;
use App\Services\AI\Providers\GeminiClient;
use Illuminate\Support\Str;

class AiCopilotStreamingService
{
    public function __construct(
        private readonly GeminiClient                $geminiClient,
        private readonly AiCopilotIntentDetector     $intentDetector,
        private readonly AiCopilotMessageRepository  $messageRepo,
        private readonly AiPromptTemplateRepository  $templateRepo,
    ) {}

    /**
     * Stream an AI response for the given session+message.
     *
     * @param  callable(string $chunk, bool $done, ?array $finalPayload): void  $emit
     */
    public function stream(AiCopilotSession $session, AiCopilotMessage $userMessage, callable $emit): void
    {
        $input   = new AiCopilotMessageInput($userMessage->content);
        $context = AiCopilotSessionContext::fromArray($session->context_snapshot ?? []);

        // Detect intent
        $history   = $this->buildGeminiHistory($session, $userMessage->id);
        $detection = $this->intentDetector->detect($userMessage->content, $history);
        $intent    = $detection['intent'];

        // Load template
        $template = $this->templateRepo->findByIntent($intent->value);

        $systemPrompt = $this->buildSystemPrompt($template, $context);
        $userTurn     = $this->buildUserTurn($input, $template);
        $contents     = array_merge($history, [$userTurn]);

        $accumulated = '';
        $tokenUsage  = [];

        $this->geminiClient->streamWithHistory(
            systemPrompt: $systemPrompt,
            contents:     $contents,
            onChunk:      function (string $delta, bool $done, array $usage) use (
                &$accumulated, &$tokenUsage, $emit, $session, $userMessage, $intent, $detection, $template
            ) {
                if (! $done) {
                    $accumulated .= $delta;
                    $emit($delta, false, null);

                    return;
                }

                $tokenUsage = $usage;

                // Save completed assistant message
                $assistantMessage = AiCopilotMessage::create([
                    'uuid'               => Str::uuid()->toString(),
                    'session_id'         => $session->id,
                    'role'               => AiCopilotMessageRoleEnum::ASSISTANT->value,
                    'content'            => $accumulated,
                    'intent'             => $intent->value,
                    'intent_confidence'  => $detection['confidence'],
                    'token_usage'        => $tokenUsage,
                    'prompt_template_id' => $template?->id,
                    'provider'           => 'gemini',
                    'model'              => AiStudioSetting::current()->gemini_model,
                    'follow_up_chips'    => $this->defaultChips($intent),
                ]);

                // Log usage
                \App\Models\AiUsageLog::record(
                    userId:    $session->user_id,
                    tokenUsage: $tokenUsage,
                    intent:    $intent->value,
                    status:    'success',
                    sessionId: $session->id,
                    messageId: $assistantMessage->id,
                    provider:  'gemini',
                    model:     AiStudioSetting::current()->gemini_model ?? '',
                );

                $emit('', true, [
                    'uuid'             => $assistantMessage->uuid,
                    'role'             => 'assistant',
                    'content'          => $accumulated,
                    'intent'           => $intent->value,
                    'structured_output' => null,
                    'follow_up_chips'  => $assistantMessage->follow_up_chips,
                    'token_usage'      => $tokenUsage,
                ]);
            },
        );
    }

    private function buildGeminiHistory(AiCopilotSession $session, int $excludeMessageId): array
    {
        return $this->messageRepo->recentBySession($session->id, 10)
            ->filter(fn ($m) => $m->id !== $excludeMessageId)
            ->map(fn ($msg) => [
                'role'  => $msg->role === AiCopilotMessageRoleEnum::ASSISTANT ? 'model' : 'user',
                'parts' => [['text' => $msg->content]],
            ])
            ->values()
            ->toArray();
    }

    private function buildSystemPrompt(?AiPromptTemplate $template, AiCopilotSessionContext $context): string
    {
        $base    = $template?->system_prompt ?? 'You are a helpful creator copilot. Be concise and direct.';
        $ctx     = $context->toPromptContext();

        return $ctx ? "{$base}\n\n## Video Context\n{$ctx}" : $base;
    }

    private function buildUserTurn(AiCopilotMessageInput $input, ?AiPromptTemplate $template): array
    {
        $text = $input->content;

        if ($template?->user_template && str_contains($template->user_template, '{{user_message}}')) {
            $text = str_replace('{{user_message}}', $text, $template->user_template);
        }

        return ['role' => 'user', 'parts' => [['text' => $text]]];
    }

    private function defaultChips(AiCopilotIntentEnum $intent): array
    {
        return match ($intent) {
            AiCopilotIntentEnum::WRITE_CAPTION    => ['Make it shorter', 'Generate hashtags', 'Analyze viral potential'],
            AiCopilotIntentEnum::ANALYZE_VIRAL    => ['How to improve?', 'Write a better caption', 'Suggest CTA'],
            default                               => ['Write a caption', 'Generate hashtags', 'Analyze viral potential'],
        };
    }
}
