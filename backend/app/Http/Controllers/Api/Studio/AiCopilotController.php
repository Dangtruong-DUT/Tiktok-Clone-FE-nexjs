<?php

namespace App\Http\Controllers\Api\Studio;

use App\DTOs\AI\AiCopilotMessageInput;
use App\Http\Controllers\Controller;
use App\Http\Requests\Studio\SendCopilotMessageRequest;
use App\Http\Requests\Studio\StartCopilotSessionRequest;
use App\Http\Resources\Api\Studio\Copilot\AiCopilotMessageResource;
use App\Http\Resources\Api\Studio\Copilot\AiCopilotSessionResource;
use App\Http\Response\ApiResponse;
use App\Models\AiStudioSetting;
use App\Repositories\AiCopilotSessionRepository;
use App\Services\AI\Copilot\AiCopilotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AiCopilotController extends Controller
{
    public function __construct(
        private readonly AiCopilotService           $copilotService,
        private readonly AiCopilotSessionRepository $sessionRepo,
    ) {}

    /**
     * Start a new AI Copilot session or return an existing active one.
     */
    public function startSession(StartCopilotSessionRequest $request): JsonResponse
    {
        $settings = AiStudioSetting::current();

        if (! $settings->copilot_enabled) {
            return ApiResponse::error('AI Copilot is currently disabled.', 503);
        }

        $session = $this->copilotService->startSession($request->user()->id, $request->validated());

        $session->load(['messages' => fn ($q) => $q->orderBy('created_at')->limit(20)]);

        return ApiResponse::created(new AiCopilotSessionResource($session));
    }

    /**
     * Load a session with its recent messages.
     */
    public function showSession(Request $request, string $uuid): JsonResponse
    {
        $session = $this->copilotService->getSessionWithMessages($uuid, $request->user()->id);

        return ApiResponse::success(new AiCopilotSessionResource($session));
    }

    /**
     * Accept a user message and return a stream token + SSE URL.
     * All messages go through the streaming path; non-streaming is removed.
     */
    public function sendMessage(SendCopilotMessageRequest $request, string $uuid): JsonResponse
    {
        $session  = $this->sessionRepo->findByUuidAndUserOrFail($uuid, $request->user()->id);
        $input    = AiCopilotMessageInput::fromRequest($request->validated());
        $msgUuid  = Str::uuid()->toString();

        $userMessage = $this->copilotService->createUserMessage($session, $input, $msgUuid);

        if ($input->hasVideoClip() || $input->hasFrames() || $input->hasTimeline()) {
            $this->copilotService->cacheAttachments($msgUuid, [
                'video_clip'     => $input->videoClip,
                'frames'         => $input->frames,
                'timeline_start' => $input->timelineStart,
                'timeline_end'   => $input->timelineEnd,
            ]);
        }

        $token = $this->copilotService->generateStreamToken(
            $session->uuid,
            $userMessage->uuid,
            $request->user()->id,
        );

        return ApiResponse::success([
            'streaming'    => true,
            'message_uuid' => $userMessage->uuid,
            'stream_token' => $token,
            'stream_url'   => route('api.v1.studio.ai.copilot.stream', [
                'uuid'         => $session->uuid,
                'message_uuid' => $userMessage->uuid,
            ]),
        ], 'Streaming', 202);
    }

    /**
     * Open the SSE stream for a previously accepted message.
     */
    public function stream(Request $request, string $uuid, string $messageUuid): StreamedResponse
    {
        $token  = (string) $request->query('token', '');
        $userId = $this->copilotService->validateStreamToken($token, $uuid, $messageUuid);

        abort_unless($userId !== null, 403, 'Invalid or expired stream token.');

        $session     = $this->copilotService->getSessionWithMessages($uuid, $userId);
        $userMessage = $session->messages->firstWhere('uuid', $messageUuid)
            ?? abort(404, 'Message not found in session.');

        return response()->stream(function () use ($session, $userMessage) {
            $this->copilotService->stream(
                session:     $session,
                userMessage: $userMessage,
                emit:        function (string $chunk, bool $done, ?array $finalPayload) {
                    if (! $done) {
                        echo 'data: ' . json_encode(['type' => 'chunk', 'delta' => $chunk]) . "\n\n";
                    } else {
                        echo 'data: ' . json_encode(['type' => 'done', 'message' => $finalPayload]) . "\n\n";
                    }
                    ob_flush();
                    flush();
                },
            );
        }, 200, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Connection'        => 'keep-alive',
        ]);
    }

    /**
     * Mark an assistant message as accepted by the user.
     */
    public function accept(Request $request, string $messageUuid): JsonResponse
    {
        $message = $this->copilotService->getMessageByUuidForUser($messageUuid, $request->user()->id);
        $message->update(['status' => 'accepted']);

        return ApiResponse::success(new AiCopilotMessageResource($message));
    }

    /**
     * Mark an assistant message as rejected by the user.
     */
    public function reject(Request $request, string $messageUuid): JsonResponse
    {
        $message = $this->copilotService->getMessageByUuidForUser($messageUuid, $request->user()->id);
        $message->update(['status' => 'rejected']);

        return ApiResponse::success(new AiCopilotMessageResource($message));
    }

    /**
     * Expire a session immediately (user-initiated close).
     */
    public function destroySession(Request $request, string $uuid):\Illuminate\Http\Response
    {
        $session = $this->sessionRepo->findByUuidAndUserOrFail($uuid, $request->user()->id);
        $this->copilotService->expireSession($session);

        return ApiResponse::noContent();
    }
}
