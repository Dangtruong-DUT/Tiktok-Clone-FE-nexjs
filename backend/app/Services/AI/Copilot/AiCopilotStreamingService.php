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

    /**
     * Validate the stream token and return the authenticated user_id, or null if invalid/expired.
     * Does NOT require a pre-known user_id — the user identity is derived from the token itself.
     */
    public function validateStreamToken(string $token, string $sessionUuid, string $messageUuid): ?int
    {
        try {
            $payload = json_decode(Crypt::decryptString($token), true);

            if (
                ! is_array($payload)
                || ($payload['session_uuid'] ?? null) !== $sessionUuid
                || ($payload['message_uuid'] ?? null) !== $messageUuid
                || ($payload['exp']          ?? 0)    <  now()->timestamp
            ) {
                return null;
            }

            return (int) $payload['user_id'];
        } catch (\Throwable) {
            return null;
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

        // Merge session snapshot with live form content sent with this message
        $contextData                     = $session->context_snapshot ?? [];
        $contextData['current_caption']  = $input->currentCaption  ?? ($contextData['current_caption'] ?? null);
        $contextData['current_title']    = $input->currentTitle    ?? ($contextData['current_title']   ?? null);
        $contextData['current_hashtags'] = $input->currentHashtags ?? ($contextData['current_hashtags'] ?? null);

        $contextData['user_id'] = null; // userId is runtime-only, not from DB
        $context  = new AiCopilotSessionContext(
            videoTitle:        $contextData['video_title']        ?? null,
            videoDescription:  $contextData['video_description']  ?? null,
            videoCategory:     $contextData['video_category']     ?? null,
            videoTranscript:   $contextData['video_transcript']   ?? null,
            ocrText:           $contextData['ocr_text']           ?? null,
            creatorLanguage:   $contextData['creator_language']   ?? 'vi',
            uploadSessionUuid: $contextData['upload_session_uuid'] ?? null,
            postUuid:          $contextData['post_uuid']          ?? null,
            currentCaption:    $contextData['current_caption']    ?? null,
            currentHashtags:   $contextData['current_hashtags']   ?? null,
            currentTitle:      $contextData['current_title']      ?? null,
            userId:            $session->user_id,
        );
        $locale   = (string) ($session->session_meta['locale'] ?? $context->creatorLanguage ?? 'vi');
        $history  = AbstractCopilotHandler::buildHistory($session, $this->messageRepo, excludeMessageId: $userMessage->id);

        // Keyword-based intent detection avoids a second Gemini call on the streaming path.
        $detection = $this->detectIntentByKeyword($input);
        $intent    = $detection['intent'];

        $template     = $this->templateRepo->findByIntent($intent->value) ?? $this->makeFallbackTemplate($intent);
        $systemPrompt = AbstractCopilotHandler::buildSystemPrompt($template, $context);
        $userTurn     = AbstractCopilotHandler::buildUserTurn($input, $template);
        $contents     = array_merge($history, [$userTurn]);

        $accumulated = '';
        $tokenUsage  = [];

        // Generative intents return JSON — buffer silently so the client never
        // sees raw JSON chunks, only the finished content_card.
        $silentStream = $intent->isGenerative();

        try {
            $this->geminiClient->streamWithHistory(
                systemPrompt: $systemPrompt,
                contents:     $contents,
                onChunk:      function (string $delta, bool $done, array $usage) use (
                    &$accumulated, &$tokenUsage, $emit, $session, $intent, $detection, $template,
                    $silentStream, $locale
                ) {
                    if (! $done) {
                        $accumulated .= $delta;
                        if (! $silentStream) {
                            $emit($delta, false, null);
                        }
                        return;
                    }

                    $tokenUsage      = $usage;
                    $structuredOutput = null;
                    $displayContent  = $accumulated;

                    // Parse JSON for generative intents and build a content_card
                    if ($silentStream) {
                        $clean = AbstractCopilotHandler::cleanJsonResponse($accumulated);
                        $data  = json_decode($clean, true) ?? [];

                        if (! empty($data['variants'])) {
                            // Standard format: {"variants": [...], "hashtags": [...]}
                            $structuredOutput = [
                                'type'         => 'content_card',
                                'target_field' => $intent->targetFormField() ?? 'content',
                                'variants'     => $data['variants'],
                                'hashtags'     => $data['hashtags'] ?? [],
                                'confidence'   => (float) ($data['confidence'] ?? 0.85),
                            ];
                            $displayContent = $data['variants'][0]['value'] ?? $accumulated;
                        } elseif (! empty($data['caption']) || ! empty($data['text']) || ! empty($data['content'])) {
                            // Alternative format: {"caption": "...", "hashtags": [...]}
                            $text = $data['caption'] ?? $data['text'] ?? $data['content'] ?? '';
                            $structuredOutput = [
                                'type'         => 'content_card',
                                'target_field' => $intent->targetFormField() ?? 'content',
                                'variants'     => [['label' => 'Gợi ý', 'value' => $text]],
                                'hashtags'     => $data['hashtags'] ?? [],
                                'confidence'   => (float) ($data['confidence'] ?? 0.85),
                            ];
                            $displayContent = $text;
                        } elseif (! empty($data['hashtags'])) {
                            // Hashtag-only response
                            $structuredOutput = [
                                'type'         => 'content_card',
                                'target_field' => 'hashtags',
                                'variants'     => [['label' => 'Hashtags', 'value' => implode(' ', $data['hashtags'])]],
                                'hashtags'     => $data['hashtags'],
                                'confidence'   => (float) ($data['confidence'] ?? 0.85),
                            ];
                            $displayContent = implode(' ', $data['hashtags']);
                        }
                    }

                    $assistantMessage = AiCopilotMessage::create([
                        'uuid'               => Str::uuid()->toString(),
                        'session_id'         => $session->id,
                        'role'               => AiCopilotMessageRoleEnum::ASSISTANT->value,
                        'content'            => $displayContent,
                        'intent'             => $intent->value,
                        'intent_confidence'  => $detection['confidence'],
                        'structured_output'  => $structuredOutput,
                        'token_usage'        => $tokenUsage,
                        'prompt_template_id' => $template?->id,
                        'provider'           => 'gemini',
                        'model'              => AiStudioSetting::current()->gemini_model,
                        'follow_up_chips'    => $this->defaultChips($intent, $locale),
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
                        'content'           => $displayContent,
                        'status'            => 'success',
                        'intent'            => $intent->value,
                        'structured_output' => $structuredOutput,
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
                'status'            => 'failed',
                'intent'            => $intent->value,
                'structured_output' => null,
                'follow_up_chips'   => str_starts_with($locale ?? 'vi', 'vi')
                    ? ['Thử lại', 'Hỏi câu khác']
                    : ['Try again', 'Ask something else'],
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
            [AiCopilotIntentEnum::WRITE_CAPTION, [
                'caption', 'viết caption', 'tạo caption', 'write caption',
                'viết nội dung', 'viết content', 'tạo content', 'tạo nội dung',
                'nội dung bài đăng', 'bài đăng', 'đưa vào bài', 'áp dụng vào bài',
                'đặt caption', 'thêm caption', 'chữ bài đăng', 'post text',
            ]],
            [AiCopilotIntentEnum::WRITE_TITLE, [
                'tiêu đề', 'write title', 'tạo tiêu đề', 'đặt tiêu đề',
                'tên video', 'video title',
            ]],
            [AiCopilotIntentEnum::WRITE_DESCRIPTION, [
                'mô tả', 'description', 'viết mô tả', 'tạo mô tả', 'mô tả video',
                'describe', 'giới thiệu video',
            ]],
            [AiCopilotIntentEnum::GENERATE_HASHTAGS, [
                'hashtag', 'tag', 'thẻ', 'tạo hashtag', 'viết hashtag',
                'gợi ý hashtag', 'hashtags cho', 'thêm hashtag',
            ]],
            [AiCopilotIntentEnum::REWRITE_CONTENT, [
                'viết lại', 'rewrite', 'cải thiện', 'improve', 'sửa',
                'làm lại', 'nâng cấp', 'tối ưu', 'optimize', 'chỉnh sửa',
                'hay hơn', 'tốt hơn', 'better', 'upgrade',
            ]],
            [AiCopilotIntentEnum::ANALYZE_VIRAL, [
                'viral', 'xu hướng', 'trend', 'lan truyền',
                'tiềm năng viral', 'viral potential', 'có viral không',
            ]],
            [AiCopilotIntentEnum::ANALYZE_HOOK, [
                'hook', 'mở đầu', 'intro', 'giây đầu', 'opening',
                '3 giây đầu', 'phần mở', 'bắt đầu video',
            ]],
            [AiCopilotIntentEnum::ANALYZE_RETENTION, [
                'retention', 'giữ chân', 'xem hết', 'watch time',
                'người xem bỏ', 'tỉ lệ xem', 'completion rate',
            ]],
            [AiCopilotIntentEnum::ANALYZE_CTA, [
                'cta', 'call to action', 'kêu gọi',
                'kêu gọi hành động', 'action', 'follow', 'like',
            ]],
            [AiCopilotIntentEnum::ANALYZE_AUDIENCE, [
                'audience', 'đối tượng', 'target', 'khán giả',
                'phù hợp ai', 'xem nhiều', 'demographics',
            ]],
            [AiCopilotIntentEnum::ANALYZE_VIDEO, [
                'phân tích video', 'analyze video', 'đánh giá video', 'review video',
                'nhận xét video', 'feedback video', 'góp ý video',
            ]],
            [AiCopilotIntentEnum::SCHEDULE_POST, [
                'lên lịch', 'schedule', 'đăng lúc', 'post at',
                'đăng vào', 'đăng lúc nào', 'thời gian đăng', 'publish',
            ]],
            [AiCopilotIntentEnum::SUGGEST_CTA, [
                'viết cta', 'write cta', 'suggest cta', 'kêu gọi hành động',
                'lời kêu gọi', 'thêm cta',
            ]],
            [AiCopilotIntentEnum::QUERY_USER_STATS, [
                'thống kê của tôi', 'thông tin tài khoản', 'bao nhiêu follow',
                'profile của tôi', 'followers của tôi', 'thông tin cá nhân',
            ]],
            [AiCopilotIntentEnum::QUERY_POST_STATS, [
                'bài đăng của tôi', 'post gần nhất', 'video của tôi',
                'bài đăng gần đây', 'bao nhiêu bài', 'thống kê bài đăng',
            ]],
            [AiCopilotIntentEnum::QUERY_SCREEN_TIME, [
                'thời gian sử dụng', 'screen time', 'xem bao lâu',
                'lịch sử xem', 'thói quen xem', 'thống kê thời gian',
            ]],
            [AiCopilotIntentEnum::NAVIGATE_TO, [
                'đường đến', 'tới trang', 'chuyển đến', 'link tới',
                'tìm ở đâu', 'ở đâu trong app', 'navigate to', 'dẫn đến trang',
            ]],
            [AiCopilotIntentEnum::QUERY_APP_INFO, [
                'snapi là gì', 'tính năng nào', 'web làm được gì', 'hướng dẫn sử dụng',
                'app có gì', 'how to use', 'giới thiệu snapi', 'snapi có thể',
            ]],
            [AiCopilotIntentEnum::ADMIN_QUERY_STATS, [
                'thống kê hệ thống', 'admin stats', 'platform stats',
                'bao nhiêu user', 'ai metrics', 'doanh thu ai', 'tổng số người dùng',
            ]],
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

        if (str_contains($msg, '400') || str_contains($msg, 'API key not valid') || str_contains($msg, 'INVALID_ARGUMENT')) {
            return 'Cấu hình AI không hợp lệ — vui lòng kiểm tra API key trong cài đặt.';
        }

        if (str_contains($msg, '403') || str_contains($msg, 'PERMISSION_DENIED')) {
            return 'API key không có quyền truy cập model này.';
        }

        return 'Đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại.';
    }

    private function makeFallbackTemplate(?AiCopilotIntentEnum $intent = null): AiPromptTemplate
    {
        $isGenerative = $intent?->isGenerative() ?? false;

        $base = 'You are Snapi Studio AI — a smart content copilot for short-form video creators (TikTok/Reels style). '
            . 'You deeply understand trending content, viral hooks, and platform algorithms. '
            . 'Always respond in the same language the user writes in (Vietnamese or English). '
            . 'Use the Video Context below to tailor every suggestion to the creator\'s actual content.';

        if ($isGenerative) {
            $base .= "\n\nFor caption/hashtag requests you MUST return ONLY valid JSON (no markdown, no code fences) "
                . "in this exact shape:\n"
                . "{\n"
                . "  \"variants\": [{\"label\": \"Short\", \"value\": \"...\"}, {\"label\": \"Engaging\", \"value\": \"...\"}, {\"label\": \"Viral\", \"value\": \"...\"}],\n"
                . "  \"hashtags\": [\"#tag1\", \"#tag2\"],\n"
                . "  \"confidence\": 0.9\n"
                . "}\n"
                . "Provide 3 variants (Short / Engaging / Viral). Hashtags: 6–10 relevant tags mix of Vietnamese + English.";
        }

        $template               = new AiPromptTemplate();
        $template->system_prompt = $base;
        $template->user_template = '{{user_message}}';

        return $template;
    }

    private function defaultChips(AiCopilotIntentEnum $intent, string $locale = 'vi'): array
    {
        $isVi = str_starts_with($locale, 'vi');

        return match ($intent) {
            AiCopilotIntentEnum::WRITE_CAPTION,
            AiCopilotIntentEnum::WRITE_TITLE,
            AiCopilotIntentEnum::WRITE_DESCRIPTION,
            AiCopilotIntentEnum::REWRITE_CONTENT => $isVi
                ? ['Ngắn hơn', 'Tạo hashtag', 'Phân tích viral', 'Đề xuất CTA']
                : ['Make it shorter', 'Generate hashtags', 'Analyze viral potential', 'Suggest CTA'],

            AiCopilotIntentEnum::GENERATE_HASHTAGS => $isVi
                ? ['Viết caption', 'Phân tích viral', 'Đề xuất CTA']
                : ['Write a caption', 'Analyze viral potential', 'Suggest CTA'],

            AiCopilotIntentEnum::ANALYZE_VIRAL => $isVi
                ? ['Cải thiện như thế nào?', 'Viết caption hay hơn', 'Đề xuất CTA', 'Phân tích hook']
                : ['How to improve?', 'Write a better caption', 'Suggest CTA', 'Analyze hook'],

            AiCopilotIntentEnum::ANALYZE_VIDEO_SEGMENT,
            AiCopilotIntentEnum::ANALYZE_VIDEO,
            AiCopilotIntentEnum::ANALYZE_FRAME => $isVi
                ? ['Phân tích hook', 'Viết caption', 'Tạo hashtag', 'Phân tích viral']
                : ['Analyze the hook', 'Write a caption', 'Generate hashtags', 'Analyze viral potential'],

            AiCopilotIntentEnum::SCHEDULE_POST => $isVi
                ? ['Viết caption', 'Tạo hashtag', 'Phân tích viral']
                : ['Write a caption', 'Generate hashtags', 'Analyze viral potential'],

            default => $isVi
                ? ['Viết caption', 'Tạo hashtag', 'Phân tích viral', 'Phân tích hook']
                : ['Write a caption', 'Generate hashtags', 'Analyze viral potential', 'Analyze hook'],
        };
    }
}
