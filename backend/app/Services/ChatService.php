<?php

namespace App\Services;

use App\Events\MessageSent;
use App\Exceptions\http\BadRequestException;
use App\Exceptions\http\ForbiddenException;
use App\Exceptions\http\NotFoundException;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageMedia;
use App\Repositories\ConversationRepository;
use App\Repositories\MessageRepository;
use App\Repositories\UserRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ChatService
{
    public function __construct(
        private readonly ConversationRepository $conversationRepository,
        private readonly MessageRepository $messageRepository,
        private readonly UserRepository $userRepository,
    ) {}

    public function getConversations(array $filters): LengthAwarePaginator
    {
        return $this->conversationRepository->getByParticipant((int) auth_user_id(), $filters);
    }

    public function createOrGetPrivateConversation(string $targetUserUuid): Conversation
    {
        $authUserId = (int) auth_user_id();
        $targetUser = $this->userRepository->findByUuid($targetUserUuid);

        if ($targetUser === null) {
            throw new NotFoundException('Target user not found');
        }

        $targetUserId = (int) $targetUser->id;

        if ($authUserId === $targetUserId) {
            throw new BadRequestException('Cannot create a private conversation with yourself');
        }

        $conversation = $this->conversationRepository->createPrivateConversation($authUserId, $targetUserId);

        return $this->conversationRepository
            ->query()
            ->where('id', $conversation->id)
            ->with([
                'participants' => fn ($participantQuery) => $participantQuery
                    ->select('users.*')
                    ->with('avatarFile'),
                'latestMessage' => fn ($messageQuery) => $messageQuery
                    ->with(['sender.avatarFile', 'medias.uploadFile', 'replyTo']),
            ])
            ->firstOrFail();
    }

    public function getMessages(int $conversationId, array $filters): LengthAwarePaginator
    {
        $this->assertParticipant($conversationId);

        return $this->messageRepository->getByConversationId($conversationId, $filters);
    }

    public function sendMessage(int $conversationId, array $payload): Message
    {
        $conversation = $this->assertParticipant($conversationId);
        $replyToId = $payload['reply_to_id'] ?? null;

        if ($replyToId !== null) {
            $replyMessage = $this->messageRepository->find((int) $replyToId);
            if (!$replyMessage instanceof Message || $replyMessage->conversation_id !== $conversation->id) {
                throw new BadRequestException('Reply target must belong to the same conversation');
            }
        }

        /** @var Message $message */
        $message = DB::transaction(function () use ($payload, $conversation): Message {
            /** @var Message $message */
            $message = $this->messageRepository->create([
                'conversation_id' => $conversation->id,
                'sender_id' => (int) auth_user_id(),
                'content' => (string) $payload['content'],
                'type' => (int) $payload['type'],
                'reply_to_id' => $payload['reply_to_id'] ?? null,
            ]);

            foreach (($payload['medias'] ?? []) as $media) {
                MessageMedia::query()->create([
                    'message_id' => $message->id,
                    'upload_file_id' => (int) $media['file_id'],
                    'type' => (int) $media['type'],
                    'order' => (int) ($media['order'] ?? 0),
                ]);
            }

            $conversation->touch();

            return $message;
        });

        $message->loadMissing(['sender.avatarFile', 'medias.uploadFile', 'replyTo']);

        MessageSent::dispatch($message);

        return $message;
    }

    public function markAsRead(int $conversationId): void
    {
        $conversation = $this->assertParticipant($conversationId);

        $conversation->participantRows()
            ->where('user_id', (int) auth_user_id())
            ->update(['last_read_at' => now()]);
    }

    public function getUnreadCount(): int
    {
        return $this->conversationRepository->countUnreadByParticipant((int) auth_user_id());
    }

    private function assertParticipant(int $conversationId): Conversation
    {
        $conversation = $this->conversationRepository->find($conversationId);

        if (!$conversation instanceof Conversation) {
            throw new NotFoundException('Conversation not found');
        }

        $isParticipant = $conversation->participants()->where('user_id', (int) auth_user_id())->exists();

        if (!$isParticipant) {
            throw new ForbiddenException('You are not a participant of this conversation');
        }

        return $conversation;
    }
}
