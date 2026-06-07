<?php

namespace App\Services\AI\Copilot;

use App\Contracts\AI\GeminiClientInterface;
use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\Gemini\GeminiConfig;
use App\DTOs\AI\Gemini\GeminiRequest;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Enums\Ai\AiCopilotMessageRoleEnum;
use App\Enums\User\RoleTypeEnum;
use App\Models\AiCopilotMessage;
use App\Models\AiCopilotSession;
use App\Models\AiPromptTemplate;
use App\Models\AiStudioSetting;
use App\Models\User;
use App\Repositories\AiCopilotMessageRepository;
use App\Repositories\AiCopilotSessionRepository;
use App\Repositories\AiPromptTemplateRepository;
use App\Services\AI\Copilot\Handlers\AbstractCopilotHandler;
use App\Services\AI\Copilot\Handlers\AdminQueryAiMetricsHandler;
use App\Services\AI\Copilot\Handlers\AdminQueryAppealsHandler;
use App\Services\AI\Copilot\Handlers\AdminQueryEncodingHandler;
use App\Services\AI\Copilot\Handlers\AdminQueryStatsHandler;
use App\Services\AI\Copilot\Handlers\CopilotHandlerInterface;
use App\Services\AI\Copilot\Handlers\NavigateToHandler;
use App\Services\AI\Copilot\Handlers\QueryAppInfoHandler;
use App\Services\AI\Copilot\Handlers\QueryNotificationsHandler;
use App\Services\AI\Copilot\Handlers\QueryPostStatsHandler;
use App\Services\AI\Copilot\Handlers\QueryScreenTimeHandler;
use App\Services\AI\Copilot\Handlers\QueryUserStatsHandler;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class AiCopilotService
{
    public function __construct(
        private readonly GeminiClientInterface      $geminiClient,
        private readonly AiCopilotSessionRepository $sessionRepo,
        private readonly AiCopilotMessageRepository $messageRepo,
        private readonly AiPromptTemplateRepository $templateRepo,
        private readonly AiCopilotIntentDetector    $intentDetector,
        // Pure-handler intents — resolved directly without a Gemini call
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

    // -------------------------------------------------------------------------
    // Session management
    // -------------------------------------------------------------------------

    /**
     * Start a new copilot session or return an existing active one for the same context.
     */
    public function startSession(int $userId, array $data): AiCopilotSession
    {
        $settings = AiStudioSetting::current();

        $existing = $this->findExistingSession($userId, $data);
        if ($existing) {
            return $existing;
        }

        $context = new AiCopilotSessionContext(
            videoTitle:        $data['context_snapshot']['video_title']        ?? null,
            videoDescription:  $data['context_snapshot']['video_description']  ?? null,
            videoCategory:     $data['context_snapshot']['video_category']     ?? null,
            videoTranscript:   $data['context_snapshot']['video_transcript']   ?? null,
            ocrText:           $data['context_snapshot']['ocr_text']           ?? null,
            creatorLanguage:   $data['context_snapshot']['creator_language']   ?? 'vi',
            uploadSessionUuid: $data['upload_session_uuid']                    ?? null,
            postUuid:          $data['post_uuid']                              ?? null,
        );

        $session = AiCopilotSession::create([
            'uuid'                => Str::uuid()->toString(),
            'user_id'             => $userId,
            'post_id'             => isset($data['post_id']) ? (int) $data['post_id'] : null,
            'upload_session_uuid' => $data['upload_session_uuid'] ?? null,
            'video_size_bytes'    => $data['video_size_bytes']    ?? null,
            'context_snapshot'    => $context->toArray(),
            'session_meta'        => ['locale' => $data['locale'] ?? 'vi'],
            'expires_at'          => now()->addHours($settings->copilot_session_ttl_hours),
        ]);

        if ($session->isLargeVideo()) {
            $this->createSystemMessage($session, 'large_video_notice');
        }

        return $session;
    }

    /**
     * Load a session with its most recent messages for the given user.
     */
    public function getSessionWithMessages(string $uuid, int $userId): AiCopilotSession
    {
        $session = $this->sessionRepo->findByUuidAndUserOrFail($uuid, $userId);

        $session->setRelation(
            'messages',
            $this->messageRepo->latestBySession($session->id, 20)
        );

        return $session;
    }

    /**
     * Persist a user-authored message to the session.
     */
    public function createUserMessage(AiCopilotSession $session, AiCopilotMessageInput $input, string $uuid): AiCopilotMessage
    {
        return AiCopilotMessage::create([
            'uuid'        => $uuid,
            'session_id'  => $session->id,
            'role'        => AiCopilotMessageRoleEnum::USER->value,
            'content'     => $input->content,
            'attachments' => $input->attachmentsMeta() ?: null,
            'provider'    => 'gemini',
        ]);
    }

    /**
     * Load a message by UUID, aborting 403 if it does not belong to the user.
     */
    public function getMessageByUuidForUser(string $messageUuid, int $userId): AiCopilotMessage
    {
        $message = $this->messageRepo->findByUuidOrFail($messageUuid);

        abort_if($message->session->user_id !== $userId, 403);

        return $message;
    }

    /**
     * Immediately expire a session (user-initiated close).
     */
    public function expireSession(AiCopilotSession $session): void
    {
        $session->update(['expires_at' => now()]);
    }

    // -------------------------------------------------------------------------
    // Streaming
    // -------------------------------------------------------------------------

    /**
     * Generate a short-lived encrypted token authorising a specific SSE stream.
     * The token embeds session UUID, message UUID, user ID and a 2-minute expiry.
     */
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
     * Validate a stream token and return the authenticated user ID, or null if invalid/expired.
     * Does NOT require a pre-known user ID — identity is derived from the token itself.
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

    /**
     * Cache large binary attachments (video clip, frames) keyed by message UUID.
     * Cached for 5 minutes — consumed once by stream() before the SSE response begins.
     *
     * @param  array<string,mixed>  $attachments
     */
    public function cacheAttachments(string $messageUuid, array $attachments): void
    {
        Cache::put("stream_attach:{$messageUuid}", $attachments, now()->addMinutes(5));
    }

    /**
     * Stream an AI response for the given session + user message via SSE callback.
     *
     * Uses hybrid intent detection: keyword (instant, 0-cost) vs Gemini (higher accuracy).
     * Pure-handler intents (query_*, navigate_to, etc.) short-circuit before any Gemini call.
     *
     * @param  callable(string $chunk, bool $done, ?array $finalPayload): void  $emit
     */
    public function stream(AiCopilotSession $session, AiCopilotMessage $userMessage, callable $emit): void
    {
        // Recover large binary attachments cached by the controller before the SSE handshake
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
        $contextData['current_caption']  = $input->currentCaption  ?? ($contextData['current_caption']  ?? null);
        $contextData['current_title']    = $input->currentTitle    ?? ($contextData['current_title']    ?? null);
        $contextData['current_hashtags'] = $input->currentHashtags ?? ($contextData['current_hashtags'] ?? null);

        $sessionUser = $session->user_id ? User::find($session->user_id) : null;
        $context     = new AiCopilotSessionContext(
            videoTitle:        $contextData['video_title']         ?? null,
            videoDescription:  $contextData['video_description']   ?? null,
            videoCategory:     $contextData['video_category']      ?? null,
            videoTranscript:   $contextData['video_transcript']    ?? null,
            ocrText:           $contextData['ocr_text']            ?? null,
            creatorLanguage:   $contextData['creator_language']    ?? 'vi',
            uploadSessionUuid: $contextData['upload_session_uuid'] ?? null,
            postUuid:          $contextData['post_uuid']           ?? null,
            currentCaption:    $contextData['current_caption']     ?? null,
            currentHashtags:   $contextData['current_hashtags']    ?? null,
            currentTitle:      $contextData['current_title']       ?? null,
            userId:            $session->user_id,
            userRole:          $sessionUser?->role instanceof RoleTypeEnum ? strtolower($sessionUser->role->name) : null,
        );
        $locale  = (string) ($session->session_meta['locale'] ?? $context->creatorLanguage ?? 'vi');
        $history = AbstractCopilotHandler::buildHistory($session, $this->messageRepo, excludeMessageId: $userMessage->id);

        // Hybrid scoring: keyword detection is instant (0 cost) and returns 0.80 for matches.
        // Gemini returns 0.0–1.0. Higher confidence wins; keyword breaks ties for reliability.
        $keywordDetection = $this->intentDetector->detectByKeyword($input, $context->userRole);
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
        // sees raw JSON chunks; only the finished content_card is emitted.
        $silentStream = $intent->isGenerative();

        try {
            $this->geminiClient->stream(
                $this->buildGeminiRequest($systemPrompt, $contents),
                function (string $delta, bool $done, array $usage) use (
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

                    $tokenUsage       = $usage;
                    $structuredOutput = null;
                    $displayContent   = $accumulated;

                    // Parse JSON for generative intents and build a content_card
                    if ($silentStream) {
                        $clean = AbstractCopilotHandler::cleanJsonResponse($accumulated);
                        $data  = json_decode($clean, true) ?? [];

                        if (! empty($data['variants'])) {
                            $structuredOutput = [
                                'type'         => 'content_card',
                                'target_field' => $intent->targetFormField() ?? 'content',
                                'variants'     => $data['variants'],
                                'hashtags'     => $data['hashtags'] ?? [],
                                'confidence'   => (float) ($data['confidence'] ?? 0.85),
                            ];
                            $displayContent = $data['variants'][0]['value'] ?? $accumulated;
                        } elseif (! empty($data['caption']) || ! empty($data['text']) || ! empty($data['content'])) {
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
                'follow_up_chips'   => (array) trans('copilot.chips.error', [], $locale),
                'token_usage'       => [],
            ]);
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Find an active session for the same upload session or post (avoids duplicate sessions).
     */
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

    /**
     * Persist any message (user or assistant) with optional extra fields.
     *
     * @param  array<string,mixed>  $extra
     */
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

    /**
     * Emit a system-generated assistant message for special session conditions.
     */
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

    /**
     * Return a minimal fallback AiPromptTemplate for intents with no DB template.
     */
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

        $template                = new AiPromptTemplate();
        $template->system_prompt = $base;
        $template->user_template = '{{user_message}}';

        return $template;
    }

    /**
     * Determine whether an intent is handled entirely by a pure handler (no Gemini call).
     */
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

    /**
     * Resolve the pure handler for a given intent.
     *
     * @throws \LogicException if the intent is not a pure-handler intent
     */
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

    /**
     * Return locale-aware follow-up chips for a given intent.
     * Chips are loaded from lang/{locale}/copilot.php so new languages require no code changes.
     *
     * @return string[]
     */
    private function defaultChips(AiCopilotIntentEnum $intent, string $locale = 'vi'): array
    {
        // Group intents that share the same chip set
        $key = match ($intent) {
            AiCopilotIntentEnum::REWRITE_CONTENT,
            AiCopilotIntentEnum::WRITE_TITLE,
            AiCopilotIntentEnum::WRITE_DESCRIPTION => 'write_caption',
            AiCopilotIntentEnum::ANALYZE_VIDEO_SEGMENT,
            AiCopilotIntentEnum::ANALYZE_FRAME     => 'analyze_video',
            default                                => $intent->value,
        };

        $chips = trans("copilot.chips.{$key}", [], $locale);

        return is_array($chips) ? $chips : (array) trans('copilot.chips.default', [], $locale);
    }

    /**
     * @param  array<array{role: string, parts: array}>  $contents
     */
    private function buildGeminiRequest(string $systemPrompt, array $contents, array $overrides = []): GeminiRequest
    {
        return new GeminiRequest(
            systemPrompt: $systemPrompt,
            contents:     $contents,
            config:       GeminiConfig::fromSetting(AiStudioSetting::current(), $overrides),
        );
    }

    /**
     * Map a Gemini or network exception to a user-friendly Vietnamese error message.
     */
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
}
