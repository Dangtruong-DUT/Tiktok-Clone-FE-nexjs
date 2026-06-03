<?php

namespace App\Services\AI\Copilot;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Enums\Ai\AiCopilotMessageRoleEnum;
use App\Models\AiCopilotMessage;
use App\Models\AiCopilotSession;
use App\Models\AiPromptTemplate;
use App\Models\AiStudioSetting;
use App\Repositories\AiCopilotMessageRepository;
use App\Repositories\AiCopilotSessionRepository;
use App\Repositories\AiPromptTemplateRepository;
use App\Repositories\AiUsageLogRepository;
use App\Services\AI\Copilot\Handlers\AnalyzeFrameHandler;
use App\Services\AI\Copilot\Handlers\AnalyzeViralHandler;
use App\Services\AI\Copilot\Handlers\CopilotHandlerInterface;
use App\Services\AI\Copilot\Handlers\GeneralAdviceHandler;
use App\Services\AI\Copilot\Handlers\GeneralAnalysisHandler;
use App\Services\AI\Copilot\Handlers\GenerateHashtagsHandler;
use App\Services\AI\Copilot\Handlers\RewriteContentHandler;
use App\Services\AI\Copilot\Handlers\SchedulePostHandler;
use App\Services\AI\Copilot\Handlers\WriteCaptionHandler;
use Illuminate\Support\Str;

class AiCopilotService
{
    private const HISTORY_WINDOW = 10;

    public function __construct(
        private readonly AiCopilotSessionRepository  $sessionRepo,
        private readonly AiCopilotMessageRepository  $messageRepo,
        private readonly AiPromptTemplateRepository  $templateRepo,
        private readonly AiUsageLogRepository        $usageLogRepo,
        private readonly AiCopilotIntentDetector     $intentDetector,
        // Handlers
        private readonly WriteCaptionHandler     $writeCaptionHandler,
        private readonly GenerateHashtagsHandler  $hashtagHandler,
        private readonly RewriteContentHandler    $rewriteHandler,
        private readonly AnalyzeViralHandler      $viralHandler,
        private readonly AnalyzeFrameHandler      $frameHandler,
        private readonly GeneralAnalysisHandler   $analysisHandler,
        private readonly GeneralAdviceHandler     $adviceHandler,
        private readonly SchedulePostHandler      $schedulePostHandler,
    ) {}

    public function startSession(int $userId, array $data): AiCopilotSession
    {
        $settings = AiStudioSetting::current();

        // Try to resume an existing active session for the same video/post
        $existing = $this->findExistingSession($userId, $data);
        if ($existing) {
            return $existing;
        }

        $context = new AiCopilotSessionContext(
            videoTitle:        $data['context_snapshot']['video_title'] ?? null,
            videoDescription:  $data['context_snapshot']['video_description'] ?? null,
            videoCategory:     $data['context_snapshot']['video_category'] ?? null,
            videoTranscript:   $data['context_snapshot']['video_transcript'] ?? null,
            ocrText:           $data['context_snapshot']['ocr_text'] ?? null,
            creatorLanguage:   $data['context_snapshot']['creator_language'] ?? 'vi',
            uploadSessionUuid: $data['upload_session_uuid'] ?? null,
            postUuid:          $data['post_uuid'] ?? null,
        );

        $session = AiCopilotSession::create([
            'uuid'                => Str::uuid()->toString(),
            'user_id'             => $userId,
            'post_id'             => isset($data['post_id']) ? (int) $data['post_id'] : null,
            'upload_session_uuid' => $data['upload_session_uuid'] ?? null,
            'video_size_bytes'    => $data['video_size_bytes'] ?? null,
            'context_snapshot'    => $context->toArray(),
            'session_meta'        => ['locale' => $data['locale'] ?? 'vi'],
            'expires_at'          => now()->addHours($settings->copilot_session_ttl_hours),
        ]);

        // Inject large-video notice as system message
        if ($session->isLargeVideo()) {
            $this->createSystemMessage($session, 'large_video_notice');
        }

        return $session;
    }

    public function processMessage(AiCopilotSession $session, AiCopilotMessageInput $input): AiCopilotMessage
    {
        $settings = AiStudioSetting::current();

        // Check session message limit
        $messageCount = $session->messages()->count();
        if ($messageCount >= $settings->copilot_max_messages_per_session * 2) {
            throw new \RuntimeException('Session message limit reached. Please start a new session.');
        }

        // Save the user message
        $userMessage = $this->saveMessage($session, AiCopilotMessageRoleEnum::USER, $input->content, [
            'attachments' => $input->attachmentsMeta(),
        ]);

        // Detect intent
        $history = $this->buildGeminiHistory($session);
        $detection = $this->intentDetector->detect($input->content, $history);
        $intent    = $detection['intent'];

        // Load prompt template
        $template = $this->templateRepo->findByIntent($intent->value)
            ?? $this->templateRepo->findByIntent(AiCopilotIntentEnum::GENERAL_ADVICE->value)
            ?? $this->fallbackTemplate($intent);

        // Resolve handler and run
        $handler      = $this->resolveHandler($intent);
        $context      = AiCopilotSessionContext::fromArray($session->context_snapshot ?? []);
        $handlerResult = $handler->handle($intent, $input, $context, $template, $history);

        // Save assistant message
        $assistantMessage = $this->saveMessage(
            session:  $session,
            role:     AiCopilotMessageRoleEnum::ASSISTANT,
            content:  $handlerResult->text,
            extra: [
                'intent'            => $intent->value,
                'intent_confidence' => $detection['confidence'],
                'structured_output' => $handlerResult->structuredOutput,
                'follow_up_chips'   => $handlerResult->followUpChips,
                'token_usage'       => $handlerResult->tokenUsage,
                'latency_ms'        => $handlerResult->latencyMs,
                'prompt_template_id' => $template?->id,
                'model'             => $session->context_snapshot['gemini_model'] ?? config('ai.gemini.model'),
            ],
        );

        // Log usage (two calls: intent detection + handler)
        $this->logUsage($session, $assistantMessage, $intent, $handlerResult, $detection['confidence']);

        return $assistantMessage;
    }

    private function findExistingSession(int $userId, array $data): ?AiCopilotSession
    {
        if (! empty($data['upload_session_uuid'])) {
            return $this->sessionRepo->findActiveByUploadSession($userId, $data['upload_session_uuid']);
        }

        if (! empty($data['post_id'])) {
            return $this->sessionRepo->findActiveByPost($userId, (int) $data['post_id']);
        }

        return null;
    }

    private function buildGeminiHistory(AiCopilotSession $session): array
    {
        $messages = $this->messageRepo->recentBySession($session->id, self::HISTORY_WINDOW);

        return $messages->map(function (AiCopilotMessage $msg) {
            $role = $msg->role === AiCopilotMessageRoleEnum::ASSISTANT ? 'model' : 'user';

            return [
                'role'  => $role,
                'parts' => [['text' => $msg->content]],
            ];
        })->values()->toArray();
    }

    private function saveMessage(
        AiCopilotSession         $session,
        AiCopilotMessageRoleEnum $role,
        string                   $content,
        array                    $extra = [],
    ): AiCopilotMessage {
        return AiCopilotMessage::create(array_merge([
            'uuid'       => Str::uuid()->toString(),
            'session_id' => $session->id,
            'role'       => $role->value,
            'content'    => $content,
            'provider'   => 'gemini',
        ], $extra));
    }

    private function createSystemMessage(AiCopilotSession $session, string $type): void
    {
        $content = match ($type) {
            'large_video_notice' => 'Your video is quite large. To give you the best analysis, could you describe what the video is about? Or let me know which part you\'d like to focus on.',
            default              => '',
        };

        if ($content === '') {
            return;
        }

        $this->saveMessage($session, AiCopilotMessageRoleEnum::ASSISTANT, $content, [
            'follow_up_chips' => ['Describe my video', 'Select a segment', 'Analyze the hook'],
        ]);
    }

    private function resolveHandler(AiCopilotIntentEnum $intent): CopilotHandlerInterface
    {
        return match ($intent) {
            AiCopilotIntentEnum::WRITE_CAPTION,
            AiCopilotIntentEnum::WRITE_TITLE,
            AiCopilotIntentEnum::WRITE_DESCRIPTION,
            AiCopilotIntentEnum::SUGGEST_CTA       => $this->writeCaptionHandler,
            AiCopilotIntentEnum::GENERATE_HASHTAGS  => $this->hashtagHandler,
            AiCopilotIntentEnum::REWRITE_CONTENT    => $this->rewriteHandler,
            AiCopilotIntentEnum::ANALYZE_VIRAL      => $this->viralHandler,
            AiCopilotIntentEnum::ANALYZE_FRAME      => $this->frameHandler,
            AiCopilotIntentEnum::SCHEDULE_POST      => $this->schedulePostHandler,
            AiCopilotIntentEnum::ANALYZE_VIDEO,
            AiCopilotIntentEnum::ANALYZE_HOOK,
            AiCopilotIntentEnum::ANALYZE_RETENTION,
            AiCopilotIntentEnum::ANALYZE_CTA,
            AiCopilotIntentEnum::ANALYZE_AUDIENCE   => $this->analysisHandler,
            default                                  => $this->adviceHandler,
        };
    }

    private function fallbackTemplate(AiCopilotIntentEnum $intent): AiPromptTemplate
    {
        $t = new AiPromptTemplate();
        $t->intent       = $intent->value;
        $t->display_name = 'Fallback';
        $t->system_prompt = 'You are a helpful creator copilot for TikTok-style short videos. Be concise and actionable.';
        $t->user_template = '{{user_message}}';

        return $t;
    }

    private function logUsage(
        AiCopilotSession    $session,
        AiCopilotMessage    $message,
        AiCopilotIntentEnum $intent,
        CopilotHandlerResult $result,
        float               $confidence,
    ): void {
        $settings = AiStudioSetting::current();

        \App\Models\AiUsageLog::record(
            userId:    $session->user_id,
            tokenUsage: $result->tokenUsage,
            intent:    $intent->value,
            status:    'success',
            sessionId: $session->id,
            messageId: $message->id,
            latencyMs: $result->latencyMs,
            provider:  'gemini',
            model:     $settings->gemini_model ?? config('ai.gemini.model'),
        );
    }
}
