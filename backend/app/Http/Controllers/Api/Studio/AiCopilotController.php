<?php

namespace App\Http\Controllers\Api\Studio;

use App\DTOs\AI\AiCopilotMessageInput;
use App\Http\Controllers\Controller;
use App\Http\Requests\Studio\SendCopilotMessageRequest;
use App\Http\Requests\Studio\StartCopilotSessionRequest;
use App\Http\Resources\AiCopilotMessageResource;
use App\Http\Resources\AiCopilotSessionResource;
use App\Models\AiStudioSetting;
use App\Repositories\AiCopilotMessageRepository;
use App\Repositories\AiCopilotSessionRepository;
use App\Services\AI\Copilot\AiCopilotService;
use App\Services\AI\Copilot\AiCopilotStreamingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AiCopilotController extends Controller
{
    public function __construct(
        private readonly AiCopilotService           $copilotService,
        private readonly AiCopilotStreamingService  $streamingService,
        private readonly AiCopilotSessionRepository $sessionRepo,
        private readonly AiCopilotMessageRepository $messageRepo,
    ) {}

    public function startSession(StartCopilotSessionRequest $request): JsonResponse
    {
        $settings = AiStudioSetting::current();

        if (! $settings->copilot_enabled) {
            return response()->json(['message' => 'AI Copilot is currently disabled.'], 503);
        }

        $session = $this->copilotService->startSession($request->user()->id, $request->validated());

        $session->load(['messages' => fn ($q) => $q->orderBy('created_at')->limit(20)]);

        return response()->json([
            'success' => true,
            'data'    => new AiCopilotSessionResource($session),
        ], 201);
    }

    public function showSession(Request $request, string $uuid): JsonResponse
    {
        $session = $this->sessionRepo->findByUuidAndUserOrFail($uuid, $request->user()->id);

        $session->setRelation(
            'messages',
            $this->messageRepo->latestBySession($session->id, 20)
        );

        return response()->json([
            'success' => true,
            'data'    => new AiCopilotSessionResource($session),
        ]);
    }

    public function sendMessage(SendCopilotMessageRequest $request, string $uuid): JsonResponse|StreamedResponse
    {
        $session  = $this->sessionRepo->findByUuidAndUserOrFail($uuid, $request->user()->id);
        $settings = AiStudioSetting::current();
        $input    = AiCopilotMessageInput::fromRequest($request->validated());

        if ($settings->isFeatureEnabled('streaming')) {
            // Save user message first, then return stream_url
            $userMessage = \App\Models\AiCopilotMessage::create([
                'uuid'        => \Illuminate\Support\Str::uuid()->toString(),
                'session_id'  => $session->id,
                'role'        => 'user',
                'content'     => $input->content,
                'attachments' => $input->attachmentsMeta() ?: null,
                'provider'    => 'gemini',
            ]);

            $token = Crypt::encryptString(json_encode([
                'session_uuid' => $session->uuid,
                'message_uuid' => $userMessage->uuid,
                'user_id'      => $request->user()->id,
                'exp'          => now()->addMinutes(2)->timestamp,
            ]));

            return response()->json([
                'success'      => true,
                'streaming'    => true,
                'message_uuid' => $userMessage->uuid,
                'stream_token' => $token,
                'stream_url'   => route('api.v1.studio.ai.copilot.stream', [
                    'uuid'         => $session->uuid,
                    'message_uuid' => $userMessage->uuid,
                ]),
            ], 202);
        }

        // Non-streaming synchronous path
        $assistantMessage = $this->copilotService->processMessage($session, $input);

        return response()->json([
            'success'   => true,
            'streaming' => false,
            'data'      => new AiCopilotMessageResource($assistantMessage),
        ]);
    }

    public function stream(Request $request, string $uuid, string $messageUuid): StreamedResponse
    {
        // Validate the short-lived token
        $token   = $request->query('token', '');
        $payload = $this->decryptStreamToken((string) $token);

        abort_if(
            $payload === null
            || $payload['session_uuid'] !== $uuid
            || $payload['message_uuid'] !== $messageUuid
            || $payload['user_id'] !== $request->user()?->id
            || $payload['exp'] < now()->timestamp,
            403,
            'Invalid or expired stream token.'
        );

        $session     = $this->sessionRepo->findByUuidAndUserOrFail($uuid, $payload['user_id']);
        $userMessage = $this->messageRepo->findByUuidOrFail($messageUuid);

        return response()->stream(function () use ($session, $userMessage) {
            $this->streamingService->stream(
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

    public function accept(Request $request, string $messageUuid): JsonResponse
    {
        $message = $this->messageRepo->findByUuidOrFail($messageUuid);
        $session = $message->session;

        abort_if($session->user_id !== $request->user()->id, 403);

        $this->messageRepo->markAccepted($message);

        return response()->json(['success' => true], 204);
    }

    public function reject(Request $request, string $messageUuid): JsonResponse
    {
        $message = $this->messageRepo->findByUuidOrFail($messageUuid);
        $session = $message->session;

        abort_if($session->user_id !== $request->user()->id, 403);

        $this->messageRepo->markRejected($message);

        return response()->json(['success' => true], 204);
    }

    public function destroySession(Request $request, string $uuid): JsonResponse
    {
        $session = $this->sessionRepo->findByUuidAndUserOrFail($uuid, $request->user()->id);
        $session->update(['expires_at' => now()]);

        return response()->json(['success' => true], 204);
    }

    private function decryptStreamToken(string $token): ?array
    {
        try {
            return json_decode(Crypt::decryptString($token), true);
        } catch (\Throwable) {
            return null;
        }
    }
}
