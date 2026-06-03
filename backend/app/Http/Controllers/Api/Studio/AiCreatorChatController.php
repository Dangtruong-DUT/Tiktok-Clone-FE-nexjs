<?php

namespace App\Http\Controllers\Api\Studio;

use App\Http\Controllers\Controller;
use App\Http\Requests\Studio\AnswerConversationStepRequest;
use App\Http\Requests\Studio\StartCreatorConversationRequest;
use App\Http\Resources\AiCreatorConversationResource;
use App\Http\Response\ApiResponse;
use App\Services\AI\Conversation\AiCreatorChatService;
use Illuminate\Http\JsonResponse;

class AiCreatorChatController extends Controller
{
    public function __construct(
        private readonly AiCreatorChatService $service,
    ) {}

    public function start(StartCreatorConversationRequest $request): JsonResponse
    {
        $conversation = $this->service->startConversation(
            (int) auth_user_id(),
            $request->initialPrompt(),
        );

        return ApiResponse::success(
            data: new AiCreatorConversationResource($conversation),
            message: 'Conversation started.',
            code: 201,
        );
    }

    public function show(string $uuid): JsonResponse
    {
        $conversation = $this->service->findByUuidForUser($uuid, (int) auth_user_id());

        return ApiResponse::success(
            data: new AiCreatorConversationResource($conversation),
            message: 'Conversation retrieved.',
        );
    }

    public function answer(AnswerConversationStepRequest $request, string $uuid): JsonResponse
    {
        $conversation = $this->service->findByUuidForUser($uuid, (int) auth_user_id());
        $updated      = $this->service->answerStep($conversation, $request->answer());

        return ApiResponse::success(
            data: new AiCreatorConversationResource($updated),
            message: 'Answer recorded.',
        );
    }

    public function skip(string $uuid): JsonResponse
    {
        $conversation = $this->service->findByUuidForUser($uuid, (int) auth_user_id());
        $updated      = $this->service->skipStep($conversation);

        return ApiResponse::success(
            data: new AiCreatorConversationResource($updated),
            message: 'Step skipped.',
        );
    }

    public function generate(string $uuid): JsonResponse
    {
        $conversation = $this->service->findByUuidForUser($uuid, (int) auth_user_id());
        $updated      = $this->service->dispatchGenerate($conversation);

        return ApiResponse::success(
            data: new AiCreatorConversationResource($updated),
            message: 'Content generation started.',
            code: 202,
        );
    }
}
