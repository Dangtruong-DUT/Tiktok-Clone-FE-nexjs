<?php

namespace App\Http\Controllers\Api\Ai;

use App\DTOs\AI\AiCopilotMessageInput;
use App\Http\Controllers\Controller;
use App\Http\Requests\Studio\DestroyCopilotSessionRequest;
use App\Http\Requests\Studio\SendCopilotMessageRequest;
use App\Http\Requests\Studio\ShowCopilotSessionRequest;
use App\Http\Requests\Studio\StartCopilotSessionRequest;
use App\Http\Requests\Studio\StreamCopilotMessageRequest;
use App\Http\Requests\Studio\UpdateCopilotMessageStatusRequest;
use App\Http\Resources\Api\Studio\Copilot\AiCopilotMessageResource;
use App\Http\Resources\Api\Studio\Copilot\AiCopilotSessionResource;
use App\Http\Response\ApiResponse;
use App\Services\AI\Copilot\AiCopilotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AiCopilotController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @param  AiCopilotService  $copilotService
     */
    public function __construct(
        private readonly AiCopilotService $copilotService,
    ) {}

    /**
     * Start a new AI Copilot session or return an existing active one.
     *
     * @param  StartCopilotSessionRequest  $request
     * @return JsonResponse
     */
    public function startSession(StartCopilotSessionRequest $request): JsonResponse
    {
        if (! $this->copilotService->isEnabled()) {
            return ApiResponse::error(trans('exceptions.ai.copilot_disabled'), 503);
        }

        ['session' => $session, 'created' => $created] = $this->copilotService->startSession(
            (int) auth_user_id(),
            $request->validated(),
        );

        $resource = new AiCopilotSessionResource($session);

        return $created
            ? ApiResponse::created(data: $resource)
            : ApiResponse::success(data: $resource);
    }

    /**
     * Load a session with its recent messages.
     *
     * @param  ShowCopilotSessionRequest  $request
     * @return JsonResponse
     */
    public function showSession(ShowCopilotSessionRequest $request, string $uuid): JsonResponse
    {
        $session = $this->copilotService->getSessionWithMessages($uuid, (int) auth_user_id());

        return ApiResponse::success(data: new AiCopilotSessionResource($session));
    }

    /**
     * Accept a user message and return a stream token + SSE URL.
     * All messages go through the streaming path; non-streaming is removed.
     *
     * @param  SendCopilotMessageRequest  $request
     * @param  string  $uuid
     * @return JsonResponse
     */
    public function sendMessage(SendCopilotMessageRequest $request, string $uuid): JsonResponse
    {
        $session  = $this->copilotService->getOwnedSession($uuid, (int) auth_user_id());
        $input    = AiCopilotMessageInput::fromRequest($request->validated());
        $msgUuid  = Str::uuid()->toString();

        $userMessage = $this->copilotService->createUserMessage($session, $input, $msgUuid);

        $token = $this->copilotService->generateStreamToken(
            $session->uuid,
            $userMessage->uuid,
            (int) auth_user_id(),
        );

        return ApiResponse::success(
            data: [
                'streaming'    => true,
                'message_uuid' => $userMessage->uuid,
                'stream_token' => $token,
                'stream_url'   => route('api.v1.studio.ai.copilot.stream', [
                    'uuid'         => $session->uuid,
                    'message_uuid' => $userMessage->uuid,
                ]),
            ],
            message: trans('messages.ai.streaming'),
            code:    202,
        );
    }

    /**
     * Open the SSE stream for a previously accepted message.
     *
     * @param  StreamCopilotMessageRequest  $request
     * @return StreamedResponse
     */
    public function stream(StreamCopilotMessageRequest $request, string $uuid, string $messageUuid): StreamedResponse
    {
        $token = (string) $request->validated('token');

        $userId = $this->copilotService->validateStreamToken($token, $uuid, $messageUuid);

        abort_unless($userId !== null, 403, 'Invalid or expired stream token.');

        $session     = $this->copilotService->getOwnedSession($uuid, $userId);
        $userMessage = $this->copilotService->getMessageInSession($messageUuid, $session->id)
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
     *
     * @param  UpdateCopilotMessageStatusRequest  $request
     * @return JsonResponse
     */
    public function accept(UpdateCopilotMessageStatusRequest $request, string $messageUuid): JsonResponse
    {
        $message = $this->copilotService->acceptMessage($messageUuid, (int) auth_user_id());

        return ApiResponse::success(data: new AiCopilotMessageResource($message));
    }

    /**
     * Mark an assistant message as rejected by the user.
     *
     * @param  UpdateCopilotMessageStatusRequest  $request
     * @return JsonResponse
     */
    public function reject(UpdateCopilotMessageStatusRequest $request, string $messageUuid): JsonResponse
    {
        $message = $this->copilotService->rejectMessage($messageUuid, (int) auth_user_id());

        return ApiResponse::success(data: new AiCopilotMessageResource($message));
    }

    /**
     * Expire a session immediately (user-initiated close).
     *
     * @param  DestroyCopilotSessionRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function destroySession(DestroyCopilotSessionRequest $request, string $uuid): \Illuminate\Http\Response
    {
        $this->copilotService->expireSessionByUuid($uuid, (int) auth_user_id());

        return ApiResponse::noContent();
    }
}
