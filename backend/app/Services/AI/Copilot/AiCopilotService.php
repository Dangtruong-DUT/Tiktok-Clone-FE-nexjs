<?php

namespace App\Services\AI\Copilot;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\Enums\Ai\AiCopilotMessageRoleEnum;
use App\Enums\User\RoleTypeEnum;
use App\Models\AiCopilotMessage;
use App\Models\AiCopilotSession;
use App\Models\AiStudioSetting;
use App\Models\User;
use App\Repositories\AiCopilotMessageRepository;
use App\Repositories\AiCopilotSessionRepository;
use App\Services\AI\Copilot\Gateway\AiGateway;
use App\Services\AI\Copilot\Orchestrator\CopilotOrchestrator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class AiCopilotService
{
    /**
     * Create a new service instance.
     *
     * @param  AiCopilotSessionRepository  $sessionRepo
     * @param  AiCopilotMessageRepository  $messageRepo
     * @param  AiGateway  $aiGateway
     * @param  CopilotOrchestrator  $orchestrator
     */
    public function __construct(
        private readonly AiCopilotSessionRepository $sessionRepo,
        private readonly AiCopilotMessageRepository $messageRepo,
        private readonly AiGateway                  $aiGateway,
        private readonly CopilotOrchestrator        $orchestrator,
    ) {}

    /**
     * Start a new copilot session or return an existing active one for the same context.
     *
     * @param  int  $userId
     * @param  array<string,mixed>  $data
     * @return array{session: AiCopilotSession, created: bool}
     */
    public function startSession(int $userId, array $data): array
    {
        $settings = AiStudioSetting::current();
        $locale   = app()->getLocale();

        $existing = $this->findExistingSession($userId, $data);
        if ($existing) {
            $existing->update([
                'session_meta' => array_merge($existing->session_meta ?? [], ['locale' => $locale]),
            ]);
            $existing->load(['messages' => fn ($q) => $q->orderBy('created_at')->limit(20)]);

            return ['session' => $existing, 'created' => false];
        }

        $context = new AiCopilotSessionContext(
            videoTitle:        $data['context_snapshot']['video_title']        ?? null,
            videoDescription:  $data['context_snapshot']['video_description']  ?? null,
            videoCategory:     $data['context_snapshot']['video_category']     ?? null,
            videoTranscript:   $data['context_snapshot']['video_transcript']   ?? null,
            ocrText:           $data['context_snapshot']['ocr_text']           ?? null,
            creatorLanguage:   $locale,
            uploadSessionUuid: $data['upload_session_uuid']                    ?? null,
            postUuid:          $data['post_uuid']                              ?? null,
        );

        $session = AiCopilotSession::create([
            'user_id'             => $userId,
            'post_id'             => isset($data['post_id']) ? (int) $data['post_id'] : null,
            'upload_session_uuid' => $data['upload_session_uuid'] ?? null,
            'video_size_bytes'    => $data['video_size_bytes']    ?? null,
            'context_snapshot'    => $context->toArray(),
            'session_meta'        => ['locale' => $locale],
            'expires_at'          => now()->addHours($settings->copilot_session_ttl_hours),
        ]);

        if ($session->isLargeVideo()) {
            $this->createSystemMessage($session, 'large_video_notice');
        }

        $session->load(['messages' => fn ($q) => $q->orderBy('created_at')->limit(20)]);

        return ['session' => $session, 'created' => true];
    }

    /**
     * Determine whether the copilot feature is enabled.
     *
     * @return bool
     */
    public function isEnabled(): bool
    {
        return (bool) AiStudioSetting::current()->copilot_enabled;
    }

    /**
     * Load a session with its most recent messages for the given user.
     *
     * @param  string  $uuid
     * @param  int  $userId
     * @return AiCopilotSession
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
     * Retrieve a copilot session by UUID and validate ownership.
     *
     * @param  string  $uuid
     * @param  int  $userId
     * @return AiCopilotSession
     */
    public function getOwnedSession(string $uuid, int $userId): AiCopilotSession
    {
        return $this->sessionRepo->findByUuidAndUserOrFail($uuid, $userId);
    }

    /**
     * Persist a user-authored message to the session.
     * Aborts with 429 if the session has reached the configured message limit.
     *
     * @param  AiCopilotSession  $session
     * @param  AiCopilotMessageInput  $input
     * @param  string  $uuid
     * @return AiCopilotMessage
     */
    public function createUserMessage(AiCopilotSession $session, AiCopilotMessageInput $input, string $uuid): AiCopilotMessage
    {
        $this->assertSessionHasCapacity($session);

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
     * Find a message by UUID scoped to a session — returns null if not found.
     * Avoids the 20-message collection limit when used from the stream endpoint.
     *
     * @param  string  $messageUuid
     * @param  int  $sessionId
     * @return AiCopilotMessage|null
     */
    public function getMessageInSession(string $messageUuid, int $sessionId): ?AiCopilotMessage
    {
        return $this->messageRepo->findByUuidAndSession($messageUuid, $sessionId);
    }

    /**
     * Load a message by UUID, aborting 403 if it does not belong to the user.
     * Uses eager-loaded session to avoid an N+1 query.
     *
     * @param  string  $messageUuid
     * @param  int  $userId
     * @return AiCopilotMessage
     */
    public function getMessageByUuidForUser(string $messageUuid, int $userId): AiCopilotMessage
    {
        $message = $this->messageRepo->findByUuidWithSession($messageUuid);

        abort_if($message->session->user_id !== $userId, 403);

        return $message;
    }

    /**
     * Accept an assistant message for the given user.
     * Validates ownership, role (assistant only), and that status is not already finalized.
     *
     * @param  string  $messageUuid
     * @param  int  $userId
     * @return AiCopilotMessage
     */
    public function acceptMessage(string $messageUuid, int $userId): AiCopilotMessage
    {
        $message = $this->getMessageByUuidForUser($messageUuid, $userId);

        abort_if($message->role !== AiCopilotMessageRoleEnum::ASSISTANT, 422, 'Only assistant messages can be accepted.');
        abort_if(in_array($message->status, ['accepted', 'rejected'], true), 422, 'Message status is already finalized.');

        $this->messageRepo->markAccepted($message);
        $message->status = 'accepted';

        return $message;
    }

    /**
     * Reject an assistant message for the given user.
     * Validates ownership, role (assistant only), and that status is not already finalized.
     *
     * @param  string  $messageUuid
     * @param  int  $userId
     * @return AiCopilotMessage
     */
    public function rejectMessage(string $messageUuid, int $userId): AiCopilotMessage
    {
        $message = $this->getMessageByUuidForUser($messageUuid, $userId);

        abort_if($message->role !== AiCopilotMessageRoleEnum::ASSISTANT, 422, 'Only assistant messages can be rejected.');
        abort_if(in_array($message->status, ['accepted', 'rejected'], true), 422, 'Message status is already finalized.');

        $this->messageRepo->markRejected($message);
        $message->status = 'rejected';

        return $message;
    }

    /**
     * Immediately expire a session (user-initiated close).
     *
     * @param  AiCopilotSession  $session
     * @return void
     */
    public function expireSession(AiCopilotSession $session): void
    {
        $session->update(['expires_at' => now()]);
    }

    /**
     * Expire a session identified by UUID for the given user.
     *
     * @param  string  $uuid
     * @param  int  $userId
     * @return void
     */
    public function expireSessionByUuid(string $uuid, int $userId): void
    {
        $this->expireSession($this->getOwnedSession($uuid, $userId));
    }

    /**
     * Generate a short-lived encrypted token authorising a specific SSE stream.
     * The token embeds session UUID, message UUID, user ID and a 2-minute expiry.
     *
     * @param  string  $sessionUuid
     * @param  string  $messageUuid
     * @param  int  $userId
     * @return string
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
     *
     * @param  string  $token
     * @param  string  $sessionUuid
     * @param  string  $messageUuid
     * @return int|null
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
     * @param  string  $messageUuid
     * @param  array<string,mixed>  $attachments
     * @return void
     */
    public function cacheAttachments(string $messageUuid, array $attachments): void
    {
        Cache::put("stream_attach:{$messageUuid}", $attachments, now()->addMinutes(5));
    }

    /**
     * Stream an AI response for the given session + user message via SSE callback.
     *
     * Uses the gateway/orchestrator pipeline to route each message to the matching engine.
     *
     * @param  callable(string $chunk, bool $done, ?array $finalPayload): void  $emit
     */
    public function stream(AiCopilotSession $session, AiCopilotMessage $userMessage, callable $emit): void
    {
        // Load setting once — reused throughout this method to avoid repeated DB queries.
        $setting = AiStudioSetting::current();

        // Recover large binary attachments cached by the controller before the SSE handshake
        $cached = Cache::pull("stream_attach:{$userMessage->uuid}", []);

        $input = new AiCopilotMessageInput(
            content:         $userMessage->content,
            frames:          $cached['frames']           ?? null,
            timelineStart:   $cached['timeline_start']   ?? null,
            timelineEnd:     $cached['timeline_end']     ?? null,
            videoClip:       $cached['video_clip']       ?? null,
            currentCaption:  $cached['current_caption']  ?? null,
            currentTitle:    $cached['current_title']    ?? null,
            currentHashtags: $cached['current_hashtags'] ?? null,
        );

        // Merge session snapshot with live form content sent with this message
        $contextData                     = $session->context_snapshot ?? [];
        $contextData['current_caption']  = $input->currentCaption  ?? ($contextData['current_caption']  ?? null);
        $contextData['current_title']    = $input->currentTitle    ?? ($contextData['current_title']    ?? null);
        $contextData['current_hashtags'] = $input->currentHashtags ?? ($contextData['current_hashtags'] ?? null);

        $locale = app()->getLocale();

        // Use the already-loaded relation if available to avoid an extra query.
        $sessionUser = $session->relationLoaded('user') ? $session->user : ($session->user_id ? User::find($session->user_id) : null);
        $context     = new AiCopilotSessionContext(
            videoTitle:        $contextData['video_title']         ?? null,
            videoDescription:  $contextData['video_description']   ?? null,
            videoCategory:     $contextData['video_category']      ?? null,
            videoTranscript:   $contextData['video_transcript']    ?? null,
            ocrText:           $contextData['ocr_text']            ?? null,
            creatorLanguage:   $locale,
            uploadSessionUuid: $contextData['upload_session_uuid'] ?? null,
            postUuid:          $contextData['post_uuid']           ?? null,
            currentCaption:    $contextData['current_caption']     ?? null,
            currentHashtags:   $contextData['current_hashtags']    ?? null,
            currentTitle:      $contextData['current_title']       ?? null,
            userId:            $session->user_id,
            userRole:          $sessionUser?->role instanceof RoleTypeEnum ? strtolower($sessionUser->role->name) : null,
        );
        $history = $this->buildHistory($session, excludeMessageId: $userMessage->id);

        $startedAt = microtime(true);
        $task      = null;

        try {
            $task = $this->aiGateway->understand(
                question:            $input->content,
                locale:              $locale,
                isAdmin:             $context->userRole === 'super_admin',
                conversationHistory: $history,
            );

            // Forward mid-stream text chunks to the SSE response; ignore the engine-internal done signal.
            $chunkEmit = static function (string $chunk, bool $done) use ($emit): void {
                if (! $done) {
                    $emit($chunk, false, null);
                }
            };

            $result = $this->orchestrator->dispatch($task, $input, $context, $history, $chunkEmit);

            $structuredOutput = $result->structuredOutput ?? [];
            $structuredOutput['task_type'] = $task->taskType;

            $assistantMessage = AiCopilotMessage::create([
                'session_id'         => $session->id,
                'role'               => AiCopilotMessageRoleEnum::ASSISTANT->value,
                'content'            => $result->text,
                'intent'             => $task->intent,
                'intent_confidence'  => $task->confidence,
                'structured_output'  => $structuredOutput,
                'follow_up_chips'    => $result->followUpChips ?: $this->gatewayDefaultChips($task->taskType, $locale),
                'token_usage'        => $result->tokenUsage,
                'provider'           => 'gemini',
                'model'              => $setting->gemini_model,
            ]);

            \App\Models\AiUsageLog::record(
                userId:     $session->user_id,
                tokenUsage: $result->tokenUsage,
                intent:     $task->intent,
                status:     'success',
                sessionId:  $session->id,
                messageId:  $assistantMessage->id,
                latencyMs:  (int) round((microtime(true) - $startedAt) * 1000),
                provider:   'gemini',
                model:      $setting->gemini_model ?? '',
            );

            $emit('', true, [
                'uuid'              => $assistantMessage->uuid,
                'role'              => 'assistant',
                'content'           => $result->text,
                'status'            => 'success',
                'intent'            => $task->intent,
                'task_type'         => $task->taskType,
                'structured_output' => $structuredOutput,
                'follow_up_chips'   => $assistantMessage->follow_up_chips,
                'token_usage'       => $result->tokenUsage,
            ]);
        } catch (\Throwable $e) {
            $errorText    = $this->friendlyError($e, $locale);
            $errorMessage = AiCopilotMessage::create([
                'session_id'    => $session->id,
                'role'          => AiCopilotMessageRoleEnum::ASSISTANT->value,
                'content'       => $errorText,
                'intent'        => $task?->intent ?? 'unknown',
                'provider'      => 'gemini',
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            \App\Models\AiUsageLog::record(
                userId:     $session->user_id,
                tokenUsage: [],
                intent:     $task?->intent ?? 'unknown',
                status:     'failed',
                sessionId:  $session->id,
                messageId:  $errorMessage->id,
                latencyMs:  (int) round((microtime(true) - $startedAt) * 1000),
                provider:   'gemini',
                model:      $setting->gemini_model ?? '',
            );

            $emit('', true, [
                'uuid'              => $errorMessage->uuid,
                'role'              => 'assistant',
                'content'           => $errorText,
                'status'            => 'failed',
                'intent'            => $task?->intent ?? 'unknown',
                'task_type'         => $task?->taskType ?? 'unknown',
                'structured_output' => null,
                'follow_up_chips'   => (array) trans('copilot.chips.error', [], $locale),
                'token_usage'       => [],
            ]);
        }
    }

    /**
     * Abort with 429 if the session has reached the configured message limit.
     */
    private function assertSessionHasCapacity(AiCopilotSession $session): void
    {
        $max   = (int) (AiStudioSetting::current()->copilot_max_messages_per_session ?? 50);
        $count = AiCopilotMessage::where('session_id', $session->id)->count();

        abort_if($count >= $max, 429, 'Session message limit reached. Please start a new session.');
    }

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
        $locale  = (string) ($session->session_meta['locale'] ?? 'vi');
        $content = match ($type) {
            'large_video_notice' => (string) trans('copilot.large_video_notice', [], $locale),
            default              => '',
        };

        if ($content === '') {
            return;
        }

        $this->saveMessage($session, AiCopilotMessageRoleEnum::ASSISTANT, $content, [
            'follow_up_chips' => (array) trans('copilot.chips.large_video_notice', [], $locale),
        ]);
    }

    /**
     * Return locale-aware follow-up chips for a gateway task_type when the engine returns none.
     *
     * @param  string  $taskType
     * @param  string  $locale
     * @return string[]
     */
    private function gatewayDefaultChips(string $taskType, string $locale = 'vi'): array
    {
        $chips = trans("copilot.chips.{$taskType}", [], $locale);

        return is_array($chips) ? $chips : (array) trans('copilot.chips.default', [], $locale);
    }

    /**
     * Build Gemini conversation history from recent session messages.
     *
     * @return array<array{role: string, parts: array}>
     */
    private function buildHistory(AiCopilotSession $session, int $window = 10, ?int $excludeMessageId = null): array
    {
        return $this->messageRepo->recentBySession($session->id, $window)
            ->filter(fn (AiCopilotMessage $message) => $excludeMessageId === null || $message->id !== $excludeMessageId)
            ->map(fn (AiCopilotMessage $message) => [
                'role'  => $message->role === AiCopilotMessageRoleEnum::ASSISTANT ? 'model' : 'user',
                'parts' => [['text' => $message->content]],
            ])
            ->values()
            ->toArray();
    }

    /**
     * Map a Gemini or network exception to a user-friendly Vietnamese error message.
     */
    private function friendlyError(\Throwable $e, string $locale): string
    {
        $msg = $e->getMessage();

        if (str_contains($msg, '429')) {
            return (string) trans('copilot.errors.rate_limited', [], $locale);
        }

        if (str_contains($msg, '503') || str_contains($msg, 'overloaded')) {
            return (string) trans('copilot.errors.overloaded', [], $locale);
        }

        if (str_contains($msg, '400') || str_contains($msg, 'API key not valid') || str_contains($msg, 'INVALID_ARGUMENT')) {
            return (string) trans('copilot.errors.invalid_config', [], $locale);
        }

        if (str_contains($msg, '403') || str_contains($msg, 'PERMISSION_DENIED')) {
            return (string) trans('copilot.errors.permission_denied', [], $locale);
        }

        return (string) trans('copilot.errors.generic', [], $locale);
    }
}
