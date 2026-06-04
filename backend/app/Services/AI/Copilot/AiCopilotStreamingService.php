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
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class AiCopilotStreamingService
{
    public function __construct(
        private readonly GeminiClient               $geminiClient,
        private readonly AiCopilotMessageRepository $messageRepo,
        private readonly AiPromptTemplateRepository $templateRepo,
    ) {}

    public function generateStreamToken(string $sessionUuid, string $messageUuid, int $userId): string
    {
        return Crypt::encryptString(json_encode([
            'session_uuid' => $sessionUuid,
            'message_uuid' => $messageUuid,
            'user_id'      => $userId,
            'exp'          => now()->addMinutes(2)->timestamp,
        ]));
    }

    public function validateStreamToken(string $token, string $sessionUuid, string $messageUuid, int $userId): bool
    {
        try {
            $payload = json_decode(Crypt::decryptString($token), true);

            return is_array($payload)
                && $payload['session_uuid'] === $sessionUuid
                && $payload['message_uuid'] === $messageUuid
                && $payload['user_id']      === $userId
                && $payload['exp']          >= now()->timestamp;
        } catch (\Throwable) {
            return false;
        }
    }

    public function cacheAttachments(string $messageUuid, array $attachments): void
    {
        Cache::put("stream_attach:{$messageUuid}", $attachments, now()->addMinutes(5));
    }

    /**
     * Stream an AI response for the given session + user message.
     *
     * @param  callable(string $chunk, bool $done, ?array $finalPayload): void  $emit
     */
    public function stream(AiCopilotSession $session, AiCopilotMessage $userMessage, callable $emit): void
    {
        // Rebuild the full input, including any large binary attachments (video_clip, frames)
        // that were cached by the controller to avoid storing them in the DB.
        $cached = Cache::pull("stream_attach:{$userMessage->uuid}", []);

        $input = new AiCopilotMessageInput(
            content:       $userMessage->content,
            frames:        $cached['frames']         ?? null,
            timelineStart: $cached['timeline_start'] ?? null,
            timelineEnd:   $cached['timeline_end']   ?? null,
            videoClip:     $cached['video_clip']     ?? null,
        );

        $context  = AiCopilotSessionContext::fromArray($session->context_snapshot ?? []);
        $history  = AbstractCopilotHandler::buildHistory($session, $this->messageRepo, excludeMessageId: $userMessage->id);

        // Keyword-based intent detection avoids a second Gemini call on the streaming path.
        $detection = $this->detectIntentByKeyword($input);
        $intent    = $detection['intent'];

        $template     = $this->templateRepo->findByIntent($intent->value) ?? $this->makeFallbackTemplate();
        $systemPrompt = AbstractCopilotHandler::buildSystemPrompt($template, $context);
        $userTurn     = AbstractCopilotHandler::buildUserTurn($input, $template);
        $contents     = array_merge($history, [$userTurn]);

        $accumulated = '';
        $tokenUsage  = [];

        try {
            $this->geminiClient->streamWithHistory(
                systemPrompt: $systemPrompt,
                contents:     $contents,
                onChunk:      function (string $delta, bool $done, array $usage) use (
                    &$accumulated, &$tokenUsage, $emit, $session, $intent, $detection, $template
                ) {
                    if (! $done) {
                        $accumulated .= $delta;
                        $emit($delta, false, null);
                        return;
                    }

                    $tokenUsage = $usage;

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

                    \App\Models\AiUsageLog::record(
                        userId:     $session->user_id,
                        tokenUsage: $tokenUsage,
                        intent:     $intent->value,
                        status:     'success',
                        sessionId:  $session->id,
                        messageId:  $assistantMessage->id,
                        provider:   'gemini',
                        model:      AiStudioSetting::current()->gemini_model ?? '',
                    );

                    $emit('', true, [
                        'uuid'              => $assistantMessage->uuid,
                        'role'              => 'assistant',
                        'content'           => $accumulated,
                        'intent'            => $intent->value,
                        'structured_output' => null,
                        'follow_up_chips'   => $assistantMessage->follow_up_chips,
                        'token_usage'       => $tokenUsage,
                    ]);
                },
            );
        } catch (\RuntimeException $e) {
            $errorText = $this->friendlyError($e);

            $emit($errorText, false, null);

            $errorMessage = AiCopilotMessage::create([
                'uuid'          => Str::uuid()->toString(),
                'session_id'    => $session->id,
                'role'          => AiCopilotMessageRoleEnum::ASSISTANT->value,
                'content'       => $errorText,
                'intent'        => $intent->value,
                'provider'      => 'gemini',
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            $emit('', true, [
                'uuid'              => $errorMessage->uuid,
                'role'              => 'assistant',
                'content'           => $errorText,
                'intent'            => $intent->value,
                'structured_output' => null,
                'follow_up_chips'   => ['Try again', 'Ask something else'],
                'token_usage'       => [],
            ]);
        }
    }

    /**
     * Keyword-based intent detection — zero extra Gemini calls.
     * Good enough for streaming: the system prompt guides the actual response quality.
     *
     * @return array{intent: AiCopilotIntentEnum, confidence: float}
     */
    private function detectIntentByKeyword(AiCopilotMessageInput $input): array
    {
        $msg = mb_strtolower($input->content);

        if ($input->hasVideoClip() || ($input->hasFrames() && $input->hasTimeline())) {
            return ['intent' => AiCopilotIntentEnum::ANALYZE_VIDEO_SEGMENT, 'confidence' => 0.95];
        }

        // PHP does not allow enum instances as array keys — use tuples instead.
        $rules = [
            [AiCopilotIntentEnum::WRITE_CAPTION,     ['caption', 'viết caption', 'tạo caption', 'write caption', 'tiêu đề']],
            [AiCopilotIntentEnum::GENERATE_HASHTAGS,  ['hashtag', 'tag', 'thẻ']],
            [AiCopilotIntentEnum::REWRITE_CONTENT,    ['viết lại', 'rewrite', 'cải thiện', 'improve', 'sửa']],
            [AiCopilotIntentEnum::ANALYZE_VIRAL,      ['viral', 'xu hướng', 'trend', 'lan truyền']],
            [AiCopilotIntentEnum::ANALYZE_HOOK,       ['hook', 'mở đầu', 'intro', 'giây đầu']],
            [AiCopilotIntentEnum::ANALYZE_RETENTION,  ['retention', 'giữ chân', 'xem hết', 'watch time']],
            [AiCopilotIntentEnum::ANALYZE_CTA,        ['cta', 'call to action', 'kêu gọi']],
            [AiCopilotIntentEnum::ANALYZE_AUDIENCE,   ['audience', 'đối tượng', 'target', 'khán giả']],
            [AiCopilotIntentEnum::ANALYZE_VIDEO,      ['phân tích video', 'analyze video', 'đánh giá video', 'review video']],
            [AiCopilotIntentEnum::SCHEDULE_POST,      ['lên lịch', 'schedule', 'đăng lúc', 'post at']],
            [AiCopilotIntentEnum::SUGGEST_CTA,        ['viết cta', 'write cta', 'suggest cta', 'kêu gọi hành động']],
        ];

        foreach ($rules as [$intent, $keywords]) {
            foreach ($keywords as $kw) {
                if (str_contains($msg, $kw)) {
                    return ['intent' => $intent, 'confidence' => 0.80];
                }
            }
        }

        return ['intent' => AiCopilotIntentEnum::GENERAL_ADVICE, 'confidence' => 0.50];
    }

    private function friendlyError(\RuntimeException $e): string
    {
        $msg = $e->getMessage();

        if (str_contains($msg, '429')) {
            return 'AI đang bận xử lý nhiều yêu cầu — vui lòng thử lại sau vài giây.';
        }

        if (str_contains($msg, '503') || str_contains($msg, 'overloaded')) {
            return 'AI hiện đang quá tải — vui lòng thử lại sau.';
        }

        return 'Đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại.';
    }

    private function makeFallbackTemplate(): AiPromptTemplate
    {
        $template               = new AiPromptTemplate();
        $template->system_prompt = 'You are a helpful creator copilot. Be concise and direct.';
        $template->user_template = '{{user_message}}';

        return $template;
    }

    private function defaultChips(AiCopilotIntentEnum $intent): array
    {
        return match ($intent) {
            AiCopilotIntentEnum::WRITE_CAPTION         => ['Make it shorter', 'Generate hashtags', 'Analyze viral potential'],
            AiCopilotIntentEnum::ANALYZE_VIRAL         => ['How to improve?', 'Write a better caption', 'Suggest CTA'],
            AiCopilotIntentEnum::ANALYZE_VIDEO_SEGMENT => ['Analyze the hook', 'Write a caption', 'Generate hashtags'],
            default                                    => ['Write a caption', 'Generate hashtags', 'Analyze viral potential'],
        };
    }
}
