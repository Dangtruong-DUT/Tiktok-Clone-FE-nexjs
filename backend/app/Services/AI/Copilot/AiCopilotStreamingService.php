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
use App\Services\AI\Copilot\Handlers\AdminQueryAppealsHandler;
use App\Services\AI\Copilot\Handlers\AdminQueryAiMetricsHandler;
use App\Services\AI\Copilot\Handlers\AdminQueryEncodingHandler;
use App\Services\AI\Copilot\Handlers\AdminQueryStatsHandler;
use App\Services\AI\Copilot\Handlers\CopilotHandlerInterface;
use App\Services\AI\Copilot\Handlers\NavigateToHandler;
use App\Services\AI\Copilot\Handlers\QueryAppInfoHandler;
use App\Services\AI\Copilot\Handlers\QueryNotificationsHandler;
use App\Services\AI\Copilot\Handlers\QueryPostStatsHandler;
use App\Services\AI\Copilot\Handlers\QueryScreenTimeHandler;
use App\Services\AI\Copilot\Handlers\QueryUserStatsHandler;
use App\Services\AI\Providers\GeminiClient;
use App\Enums\User\RoleTypeEnum;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class AiCopilotStreamingService
{
    public function __construct(
        private readonly GeminiClient               $geminiClient,
        private readonly AiCopilotMessageRepository $messageRepo,
        private readonly AiPromptTemplateRepository $templateRepo,
        private readonly AiCopilotIntentDetector    $intentDetector,
        // Pure-handler intents — no Gemini call, short-circuit streaming
        private readonly QueryPostStatsHandler      $queryPostStatsHandler,
        private readonly QueryUserStatsHandler      $queryUserStatsHandler,
        private readonly QueryScreenTimeHandler     $queryScreenTimeHandler,
        private readonly NavigateToHandler          $navigateToHandler,
        private readonly QueryAppInfoHandler        $queryAppInfoHandler,
        private readonly AdminQueryStatsHandler     $adminQueryStatsHandler,
        private readonly AdminQueryAppealsHandler   $adminQueryAppealsHandler,
        private readonly AdminQueryAiMetricsHandler $adminQueryAiMetricsHandler,
        private readonly AdminQueryEncodingHandler  $adminQueryEncodingHandler,
        private readonly QueryNotificationsHandler  $queryNotificationsHandler,
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
        $sessionUser = $session->user_id ? User::find($session->user_id) : null;
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
            userRole:          $sessionUser?->role instanceof RoleTypeEnum ? strtolower($sessionUser->role->name) : null,
        );
        $locale   = (string) ($session->session_meta['locale'] ?? $context->creatorLanguage ?? 'vi');
        $history  = AbstractCopilotHandler::buildHistory($session, $this->messageRepo, excludeMessageId: $userMessage->id);

        // Hybrid scoring: run both detectors, pick higher confidence.
        // Keyword is instant (0 cost, 0 latency) and returns 0.80 for matches / 0.50 for fallback.
        // Gemini returns 0.0–1.0 from JSON response.
        // Tie-break favours keyword, keeping data-query intents reliable even when Gemini misroutes.
        $keywordDetection = $this->detectIntentByKeyword($input, $context);
        try {
            $geminiDetection = $this->intentDetector->detect(
                userMessage:         $input->content,
                conversationHistory: $history,
                userRole:            $context->userRole,
            );
        } catch (\Throwable) {
            $geminiDetection = null;
        }

        $detection = ($geminiDetection !== null && $geminiDetection['confidence'] > $keywordDetection['confidence'])
            ? $geminiDetection
            : $keywordDetection;
        $intent    = $detection['intent'];

        $template  = $this->templateRepo->findByIntent($intent->value) ?? $this->makeFallbackTemplate($intent);
        $startedAt = microtime(true);

        // Short-circuit: pure-handler intents need no Gemini call — resolve directly and emit DONE
        if ($this->isPureHandlerIntent($intent)) {
            $handlerResult = $this->resolvePureHandler($intent)
                ->handle($intent, $input, $context, $template, $history);

            $assistantMessage = AiCopilotMessage::create([
                'uuid'               => Str::uuid()->toString(),
                'session_id'         => $session->id,
                'role'               => AiCopilotMessageRoleEnum::ASSISTANT->value,
                'content'            => $handlerResult->text,
                'intent'             => $intent->value,
                'intent_confidence'  => $detection['confidence'],
                'structured_output'  => $handlerResult->structuredOutput,
                'follow_up_chips'    => $handlerResult->followUpChips ?? $this->defaultChips($intent, $locale),
                'token_usage'        => [],
                'prompt_template_id' => $template?->id,
                'provider'           => 'gemini',
                'model'              => AiStudioSetting::current()->gemini_model,
            ]);

            \App\Models\AiUsageLog::record(
                userId:     $session->user_id,
                tokenUsage: [],
                intent:     $intent->value,
                status:     'success',
                sessionId:  $session->id,
                messageId:  $assistantMessage->id,
                latencyMs:  (int) round((microtime(true) - $startedAt) * 1000),
                provider:   'gemini',
                model:      AiStudioSetting::current()->gemini_model ?? '',
            );

            $emit('', true, [
                'uuid'              => $assistantMessage->uuid,
                'role'              => 'assistant',
                'content'           => $handlerResult->text,
                'status'            => 'success',
                'intent'            => $intent->value,
                'structured_output' => $handlerResult->structuredOutput,
                'follow_up_chips'   => $assistantMessage->follow_up_chips,
                'token_usage'       => [],
            ]);
            return;
        }

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
                    $silentStream, $locale, $startedAt
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
                        latencyMs:  (int) round((microtime(true) - $startedAt) * 1000),
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
        } catch (\Throwable $e) {
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

            \App\Models\AiUsageLog::record(
                userId:     $session->user_id,
                tokenUsage: $tokenUsage,
                intent:     $intent->value,
                status:     'failed',
                sessionId:  $session->id,
                messageId:  $errorMessage->id,
                latencyMs:  (int) round((microtime(true) - $startedAt) * 1000),
                provider:   'gemini',
                model:      AiStudioSetting::current()->gemini_model ?? '',
            );

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
    private function detectIntentByKeyword(AiCopilotMessageInput $input, AiCopilotSessionContext $context): array
    {
        $msg = mb_strtolower($input->content);

        if ($input->hasVideoClip() || ($input->hasFrames() && $input->hasTimeline())) {
            return ['intent' => AiCopilotIntentEnum::ANALYZE_VIDEO_SEGMENT, 'confidence' => 0.95];
        }

        // PHP does not allow enum instances as array keys — use tuples instead.
        $rules = [
            [AiCopilotIntentEnum::QUERY_USER_STATS, [
                // Vietnamese
                'thống kê của tôi', 'thông tin tài khoản', 'bao nhiêu follow',
                'profile của tôi', 'followers của tôi', 'thông tin cá nhân',
                'số follow', 'số người theo dõi', 'số lượng follow',
                'tài khoản của tôi', 'thống kê tài khoản',
                'tôi là ai', 'tên của tôi', 'email của tôi', 'avatar của tôi',
                'tổng view của tôi', 'tổng like của tôi', 'hồ sơ của tôi',
                'xem profile của tôi', 'thông tin về tôi', 'cá nhân tôi',
                'số bài đăng của tôi', 'tổng số bài', 'số bài lên lịch',
                'tổng like tôi có', 'tổng view tôi có',
                'tình trạng appeal của tôi', 'khiếu nại của tôi', 'appeal của tôi',
                'bao nhiêu appeal', 'kháng cáo của tôi', 'hồ sơ cá nhân',
                'tôi đang có bao nhiêu', 'tài khoản trông như thế nào',
                // English
                'my account', 'my stats', 'my profile', 'account info', 'account stats',
                'how many followers', 'my followers', 'my following',
                'my total views', 'my total likes', 'show my profile',
                'my appeal', 'appeal status', 'my appeals',
                'who am i', 'my username', 'my email', 'my avatar',
                'my post count', 'total posts', 'scheduled posts count',
            ]],
            // Specific admin intents — checked BEFORE generic ADMIN_QUERY_STATS
            [AiCopilotIntentEnum::ADMIN_QUERY_APPEALS, [
                'kháng cáo chờ', 'kháng cáo đang chờ', 'danh sách kháng cáo',
                'xem kháng cáo', 'kháng cáo chi tiết', 'thống kê kháng cáo',
                'pending appeals', 'appeal list', 'show appeals', 'review appeals',
            ]],
            [AiCopilotIntentEnum::ADMIN_QUERY_AI_METRICS, [
                // Vietnamese
                'chi phí ai hôm nay', 'chi phí ai', 'thống kê ai chi tiết',
                'top intent', 'top user ai', 'doanh thu ai',
                'copilot usage', 'ai metrics', 'ai metrics detail', 'ai usage detail',
                'thống kê ai', 'chi phí copilot', 'ai hệ thống',
                // token-specific keywords
                'token', 'số token', 'tổng token', 'token hệ thống', 'chi phí token',
                'ai token', 'bao nhiêu token', 'token đã dùng', 'tiêu tốn token',
                // English
                'ai costs today', 'ai costs', 'ai spending', 'ai usage',
                'how many tokens', 'token usage', 'tokens used', 'ai bill',
            ]],
            [AiCopilotIntentEnum::ADMIN_QUERY_ENCODING, [
                'video lỗi encoding', 'video encoding errors', 'hàng đợi encoding',
                'encoding queue', 'video lỗi mã hoá', 'video đang mã hoá',
                'encoding failures', 'encoding status', 'job encoding',
            ]],
            [AiCopilotIntentEnum::ADMIN_QUERY_STATS, [
                // Vietnamese — platform-level overview only
                'thống kê hệ thống', 'tổng số người dùng',
                'bao nhiêu bài đăng trên hệ thống', 'tổng số video hệ thống',
                'người dùng mới hôm nay', 'đăng ký mới', 'lượng truy cập',
                'hệ thống hôm nay', 'báo cáo hệ thống',
                'thống kê nền tảng', 'bao nhiêu user',
                'platform stats',
                'bao nhiêu người dùng hoạt động', 'tổng số tài khoản',
                'thống kê toàn hệ thống', 'tổng số bài trên app',
                'hệ thống có bao nhiêu', 'platform report',
                'số người dùng hệ thống', 'người dùng hệ thống',
                'số lượng người dùng', 'số người dùng hiện tại',
                'người dùng hiện tại', 'người dùng trong hệ thống',
                // English — platform-level overview only
                'system stats', 'admin stats',
                'total users', 'how many users', 'new users today',
                'total posts on platform', 'platform metrics',
                'system report', 'platform report', 'dashboard stats',
                'active users', 'sign ups today', 'overall stats',
                // quickPromptsAdmin chips
                'system user stats',
            ]],
            [AiCopilotIntentEnum::QUERY_POST_STATS, [
                // Vietnamese
                'bài đăng của tôi', 'post gần nhất', 'video của tôi',
                'bài đăng gần đây', 'bao nhiêu bài', 'thống kê bài đăng',
                'số bài đăng', 'số video', 'số lượng bài', 'số lượng video',
                'bài đăng hiện tại', 'tổng bài đăng',
                'tổng bài của tôi', 'đăng được bao nhiêu',
                'bài nào nhiều view nhất', 'bài đăng thất bại',
                'bài nháp', 'bài đang chờ', 'trạng thái bài đăng',
                'bài có bao nhiêu view', 'hiệu suất bài',
                'bài hôm nay', 'đã đăng bao nhiêu', 'video nào hot nhất',
                'thống kê chi tiết bài', 'bài đăng hiệu quả nhất',
                'bài đang lên lịch', 'video của tôi đang như thế nào',
                'xem danh sách bài', 'bài mới đăng',
                // English
                'my posts', 'my videos', 'how many posts', 'post count',
                'my recent posts', 'post stats', 'post performance',
                'best performing post', 'most viewed post', 'failed posts',
                'draft posts', 'pending posts', 'post status',
                'today posts', 'scheduled posts', 'my content',
                'show my posts', 'list my videos',
            ]],
            [AiCopilotIntentEnum::QUERY_NOTIFICATIONS, [
                // Vietnamese
                'thông báo', 'thông báo hôm nay', 'thông báo chưa đọc',
                'tôi có bao nhiêu thông báo', 'xem thông báo', 'danh sách thông báo',
                'ai like bài của tôi', 'ai follow tôi', 'ai mention tôi',
                'notification', 'notifications today', 'unread notifications',
                'chưa đọc', 'notifications', 'thông báo mới',
            ]],
            [AiCopilotIntentEnum::QUERY_SCREEN_TIME, [
                // Vietnamese
                'thời gian sử dụng', 'screen time', 'xem bao lâu',
                'lịch sử xem', 'thói quen xem', 'thống kê thời gian',
                'phân tích screen time', 'screen time của tôi', 'screen time hôm nay',
                'thời gian dùng app', 'thời gian online', 'thời gian trên app',
                'bao lâu tôi dùng', 'dùng app bao lâu', 'tôi đã dùng bao lâu',
                'thời gian sử dụng ứng dụng', 'tôi online bao lâu', 'tôi đã xem bao lâu',
                // English
                'watch history', 'time spent', 'usage time',
                'my screen time', 'my usage stats', 'how long have i been',
                'wellness stats',
            ]],
            [AiCopilotIntentEnum::SCHEDULE_POST, [
                // Vietnamese
                'lên lịch', 'đăng lúc', 'đăng vào', 'đăng lúc nào',
                'thời gian đăng', 'đặt lịch', 'lên lịch đăng', 'đăng vào ngày',
                'đăng vào giờ', 'hẹn giờ',
                'khi nào nên đăng', 'thời điểm đăng tốt nhất',
                'đăng ngày mai', 'đăng tuần sau',
                'gợi ý giờ đăng', 'đăng lúc mấy giờ thì tốt',
                'đăng vào khung giờ nào', 'tôi muốn lên lịch',
                // English
                'schedule post', 'when to post', 'best time to post',
                'post tomorrow', 'post next week', 'set schedule',
                'post at what time', 'optimal posting time',
                'schedule for later', 'plan my post',
            ]],
            [AiCopilotIntentEnum::WRITE_CAPTION, [
                // Vietnamese
                'caption', 'viết caption', 'tạo caption',
                'viết nội dung', 'viết content', 'tạo content',
                'tạo nội dung', 'nội dung bài đăng', 'đưa vào bài', 'áp dụng vào bài',
                'đặt caption', 'thêm caption', 'chữ bài đăng',
                'gợi ý caption', 'viết cho video này', 'caption hay',
                'nội dung hấp dẫn', 'viết bài đăng', 'giúp tôi viết',
                'content cho video', 'đề xuất caption', 'tạo nội dung hay',
                'viết nội dung cho video', 'tạo mô tả video',
                // English
                'write caption', 'create caption', 'caption ideas',
                'write post content', 'write post', 'help me write',
                'content for my video', 'suggest a caption',
                'write my post', 'post text',
            ]],
            [AiCopilotIntentEnum::WRITE_TITLE, [
                'tiêu đề', 'write title', 'tạo tiêu đề', 'đặt tiêu đề',
                'tên video', 'video title', 'title ideas', 'gợi ý tiêu đề',
            ]],
            [AiCopilotIntentEnum::WRITE_DESCRIPTION, [
                'mô tả', 'viết mô tả', 'tạo mô tả', 'mô tả video',
                'describe', 'giới thiệu video', 'write description', 'write a description',
                'tạo mô tả video', 'viết mô tả video',
            ]],
            [AiCopilotIntentEnum::GENERATE_HASHTAGS, [
                // Vietnamese
                'hashtag', 'tag', 'thẻ', 'tạo hashtag', 'viết hashtag',
                'gợi ý hashtag', 'hashtags cho', 'thêm hashtag',
                '#', 'tag phù hợp', 'gợi ý tag', 'tag nào dùng',
                'thẻ hashtag', 'hashtag phổ biến', 'tag cho video',
                'cần hashtag gì', 'trending hashtag',
                'tag liên quan', 'hashtag hay', 'các hashtag',
                // English
                'hashtags', 'tags', 'create hashtags',
                'suggest hashtags', 'which hashtags to use',
                'trending tags', 'relevant hashtags',
                'popular hashtags', 'add hashtags',
            ]],
            [AiCopilotIntentEnum::REWRITE_CONTENT, [
                // Vietnamese
                'viết lại', 'cải thiện', 'improve', 'sửa',
                'làm lại', 'nâng cấp', 'tối ưu', 'optimize', 'chỉnh sửa',
                'hay hơn', 'tốt hơn', 'upgrade',
                'chỉnh lại', 'sửa lại cho tốt hơn', 'cải tiến',
                'làm hay hơn', 'nâng cao chất lượng',
                // English
                'rewrite', 'make it better',
                'enhance this', 'optimize content', 'revise',
                'edit my post', 'rework this', 'fix my content',
            ]],
            [AiCopilotIntentEnum::ANALYZE_VIDEO, [
                // Vietnamese
                'phân tích video', 'analyze video', 'đánh giá video',
                'review video', 'nhận xét video', 'feedback video', 'góp ý video',
                'video này thế nào', 'đánh giá video này',
                'nhận xét về video', 'video tốt không',
                'có nên đăng không', 'video hay không',
                'chất lượng video', 'xem video của tôi',
                'video này ok không', 'phân tích nội dung video',
                // English
                'analyze this video', 'review my video', 'evaluate video',
                'is this video good', 'should i post this',
                'video quality', 'check my video', 'rate my video',
                'give feedback on video', 'critique my video',
            ]],
            [AiCopilotIntentEnum::ANALYZE_VIRAL, [
                // Vietnamese
                'viral', 'xu hướng', 'trend', 'lan truyền',
                'tiềm năng viral', 'viral potential', 'có viral không',
                'có xu hướng không', 'viral được không',
                'có thể trending không', 'khả năng viral',
                'đánh giá viral', 'có thể nổi không',
                'có thể lên trend không', 'video có hot không',
                // English
                'can this go viral', 'trending potential',
                'will this trend', 'virality score', 'viral assessment',
                'is this trending', 'will people share this',
            ]],
            [AiCopilotIntentEnum::ANALYZE_HOOK, [
                // Vietnamese
                'hook', 'mở đầu', 'intro', 'giây đầu', 'opening',
                '3 giây đầu', 'phần mở', 'bắt đầu video',
                'hook có hay không', 'mở đầu có cuốn không',
                'giây đầu tiên', 'phần intro',
                // English
                'hook quality', 'opening seconds', 'first 3 seconds',
                'intro analysis', 'opening hook', 'is hook good',
                'analyze intro', 'video start',
            ]],
            [AiCopilotIntentEnum::ANALYZE_RETENTION, [
                // Vietnamese
                'retention', 'giữ chân', 'xem hết', 'watch time',
                'người xem bỏ', 'tỉ lệ xem', 'completion rate',
                'người xem có xem hết không', 'tỉ lệ hoàn thành',
                'drop off', 'thời lượng xem',
                // English
                'retention rate', 'do viewers watch to the end',
                'drop off point', 'audience retention', 'viewer engagement',
            ]],
            [AiCopilotIntentEnum::SUGGEST_CTA, [
                // Vietnamese
                'viết cta', 'gợi ý cta', 'tạo cta', 'thêm cta', 'cta cho video',
                'lời kêu gọi', 'viết lời kêu gọi', 'gợi ý lời kêu gọi',
                // English
                'write cta', 'suggest cta', 'create cta', 'generate cta',
                'call to action ideas', 'write a call to action', 'cta suggestions',
            ]],
            [AiCopilotIntentEnum::ANALYZE_CTA, [
                // Vietnamese — phrase cụ thể, không dùng 'cta' đơn thuần
                'phân tích cta', 'đánh giá cta', 'cta có hiệu quả không',
                'cta tốt không', 'cta của tôi thế nào', 'kêu gọi hành động có tốt không',
                'cta có ổn không', 'đánh giá lời kêu gọi',
                // English
                'analyze cta', 'evaluate cta', 'cta effectiveness',
                'call to action analysis', 'is my cta good', 'review my cta',
            ]],
            [AiCopilotIntentEnum::ANALYZE_AUDIENCE, [
                'audience', 'đối tượng', 'target', 'khán giả',
                'phù hợp ai', 'xem nhiều', 'demographics',
            ]],
            [AiCopilotIntentEnum::NAVIGATE_TO, [
                // Vietnamese
                'đường đến', 'tới trang', 'chuyển đến', 'link tới',
                'tìm ở đâu', 'ở đâu trong app', 'dẫn đến trang',
                'trang nào', 'mở trang', 'đến trang', 'truy cập trang',
                // English
                'navigate to', 'go to', 'take me to', 'open page',
                'where is', 'how to get to', 'link to',
                'find the page', 'go to settings', 'open dashboard',
            ]],
            [AiCopilotIntentEnum::QUERY_APP_INFO, [
                // Vietnamese — anchor bằng "snapi" hoặc phrase đủ cụ thể
                'snapi là gì', 'tính năng nào', 'web làm được gì',
                'hướng dẫn sử dụng snapi', 'app có gì', 'giới thiệu snapi',
                'snapi có thể', 'làm thế nào để dùng', 'cách để dùng snapi',
                'cách dùng snapi', 'hướng dẫn snapi', 'chức năng snapi',
                'tính năng của snapi', 'snapi hỗ trợ gì', 'có thể làm gì trên snapi',
                'giải thích tính năng', 'snapi studio có', 'tôi cần làm gì để dùng',
                'chính sách', 'điều khoản', 'quy định',
                'chức năng này là gì', 'trang này là gì',
                'snapi hoạt động như thế nào', 'ai copilot là gì',
                'wellness là gì', 'screen time là gì', 'studio có tính năng gì',
                'tôi muốn biết về snapi', 'giới thiệu tính năng snapi',
                // English — anchor bằng "snapi" hoặc phrase đủ cụ thể
                'how to use snapi', 'what is snapi', 'snapi features',
                'how does snapi work', 'what can snapi do', 'snapi app features',
                'community guidelines', 'terms of service', 'policy',
                'what is ai copilot', 'what is wellness', 'studio features',
                'getting started with snapi', 'learn about snapi',
            ]],
        ];

        $adminOnlyIntents = [
            AiCopilotIntentEnum::ADMIN_QUERY_STATS,
            AiCopilotIntentEnum::ADMIN_QUERY_APPEALS,
            AiCopilotIntentEnum::ADMIN_QUERY_AI_METRICS,
            AiCopilotIntentEnum::ADMIN_QUERY_ENCODING,
        ];

        foreach ($rules as [$intent, $keywords]) {
            // All admin_query_* intents only fire for super_admin.
            if (in_array($intent, $adminOnlyIntents) && $context->userRole !== 'super_admin') {
                continue;
            }
            foreach ($keywords as $kw) {
                if (str_contains($msg, $kw)) {
                    return ['intent' => $intent, 'confidence' => 0.80];
                }
            }
        }

        return ['intent' => AiCopilotIntentEnum::GENERAL_ADVICE, 'confidence' => 0.50];
    }

    private function friendlyError(\Throwable $e): string
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

        $base = 'You are Snapi Studio AI — a multi-capability AI assistant for the Snapi short-form video platform. '
            . 'You help both creators and admins with: (1) content creation — captions, titles, hashtags, descriptions; '
            . '(2) video analysis — hooks, retention, viral potential, audience fit; '
            . '(3) account insights — post performance, engagement stats, appeal status; '
            . '(4) platform knowledge — how Snapi works, features, policies, wellness tools; '
            . '(5) scheduling — best posting times and schedule suggestions; '
            . '(6) admin analytics — system-wide user and content metrics. '
            . 'Always respond in the SAME language the user writes in (Vietnamese → trả lời tiếng Việt, English → reply in English). '
            . 'Be concise, helpful, and friendly. Use markdown formatting when appropriate. '
            . 'Use the Video Context and Knowledge Base sections (when provided) to tailor your answer.';

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

    private function isPureHandlerIntent(AiCopilotIntentEnum $intent): bool
    {
        return in_array($intent, [
            AiCopilotIntentEnum::QUERY_POST_STATS,
            AiCopilotIntentEnum::QUERY_USER_STATS,
            AiCopilotIntentEnum::QUERY_SCREEN_TIME,
            AiCopilotIntentEnum::NAVIGATE_TO,
            AiCopilotIntentEnum::QUERY_APP_INFO,
            AiCopilotIntentEnum::ADMIN_QUERY_STATS,
            AiCopilotIntentEnum::ADMIN_QUERY_APPEALS,
            AiCopilotIntentEnum::ADMIN_QUERY_AI_METRICS,
            AiCopilotIntentEnum::ADMIN_QUERY_ENCODING,
            AiCopilotIntentEnum::QUERY_NOTIFICATIONS,
        ]);
    }

    private function resolvePureHandler(AiCopilotIntentEnum $intent): CopilotHandlerInterface
    {
        return match ($intent) {
            AiCopilotIntentEnum::QUERY_POST_STATS        => $this->queryPostStatsHandler,
            AiCopilotIntentEnum::QUERY_USER_STATS        => $this->queryUserStatsHandler,
            AiCopilotIntentEnum::QUERY_SCREEN_TIME       => $this->queryScreenTimeHandler,
            AiCopilotIntentEnum::NAVIGATE_TO             => $this->navigateToHandler,
            AiCopilotIntentEnum::QUERY_APP_INFO          => $this->queryAppInfoHandler,
            AiCopilotIntentEnum::ADMIN_QUERY_STATS       => $this->adminQueryStatsHandler,
            AiCopilotIntentEnum::ADMIN_QUERY_APPEALS     => $this->adminQueryAppealsHandler,
            AiCopilotIntentEnum::ADMIN_QUERY_AI_METRICS  => $this->adminQueryAiMetricsHandler,
            AiCopilotIntentEnum::ADMIN_QUERY_ENCODING    => $this->adminQueryEncodingHandler,
            AiCopilotIntentEnum::QUERY_NOTIFICATIONS     => $this->queryNotificationsHandler,
            default                                       => throw new \LogicException("Intent {$intent->value} is not a pure handler"),
        };
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
