<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Conversation\CreatePrivateConversationRequest;
use App\Http\Requests\Conversation\GetConversationListRequest;
use App\Http\Requests\Conversation\GetConversationMessagesRequest;
use App\Http\Requests\Conversation\MarkConversationAsReadRequest;
use App\Http\Requests\Conversation\SendMessageRequest;
use App\Http\Resources\Api\Conversation\ConversationResource;
use App\Http\Resources\Api\Conversation\MessageResource;
use App\Http\Response\ApiResponse;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;

class ChatController extends Controller
{
    public function __construct(
        private readonly ChatService $chatService
    ) {}

    public function index(GetConversationListRequest $request): JsonResponse
    {
        $conversations = $this->chatService->getConversations($request->validated());

        return ApiResponse::success(
            data: ConversationResource::collection($conversations),
            message: 'Conversations retrieved successfully'
        );
    }

    public function createPrivate(CreatePrivateConversationRequest $request): JsonResponse
    {
        $conversation = $this->chatService->createOrGetPrivateConversation((string) $request->validated('user_uuid'));

        return ApiResponse::created(
            data: ConversationResource::make($conversation),
            message: 'Private conversation created successfully'
        );
    }

    public function messages(GetConversationMessagesRequest $request): JsonResponse
    {
        $conversationId = (int) $request->validated('conversation_id');
        $messages = $this->chatService->getMessages($conversationId, $request->validated());

        return ApiResponse::success(
            data: MessageResource::collection($messages),
            message: 'Messages retrieved successfully'
        );
    }

    public function sendMessage(SendMessageRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $message = $this->chatService->sendMessage((int) $payload['conversation_id'], $payload);

        return ApiResponse::created(
            data: MessageResource::make($message),
            message: 'Message sent successfully'
        );
    }

    public function markAsRead(MarkConversationAsReadRequest $request): JsonResponse
    {
        $this->chatService->markAsRead((int) $request->validated('conversation_id'));

        return ApiResponse::success(message: 'Conversation marked as read successfully');
    }

    public function unreadCount(): JsonResponse
    {
        return ApiResponse::success(
            data: ['unread_count' => $this->chatService->getUnreadCount()],
            message: 'Unread messages count retrieved successfully'
        );
    }
}
