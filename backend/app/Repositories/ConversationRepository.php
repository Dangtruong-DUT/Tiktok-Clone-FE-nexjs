<?php

namespace App\Repositories;

use App\Enums\Conversation\ConversationTypeEnum;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class ConversationRepository extends BaseRepository
{
    public function __construct()
    {
        $modelInstance = app()->make(Conversation::class);
        parent::__construct($modelInstance);
    }

    public function isExist(int $id): bool
    {
        return $this->query()->where('id', $id)->exists();
    }

    public function findForParticipant(int $conversationId, int $userId): ?Conversation
    {
        return $this->query()
            ->where('id', $conversationId)
            ->forParticipant($userId)
            ->first();
    }

    public function findPrivateBetweenUsers(int $firstUserId, int $secondUserId): ?Conversation
    {
        return $this->query()
            ->where('type', ConversationTypeEnum::PRIVATE->value)
            ->whereHas('participants', fn (Builder $query) => $query->where('user_id', $firstUserId))
            ->whereHas('participants', fn (Builder $query) => $query->where('user_id', $secondUserId))
            ->withCount('participants')
            ->having('participants_count', 2)
            ->first();
    }

    public function createPrivateConversation(int $firstUserId, int $secondUserId): Conversation
    {
        return DB::transaction(function () use ($firstUserId, $secondUserId): Conversation {
            $existingConversation = $this->findPrivateBetweenUsers($firstUserId, $secondUserId);

            if ($existingConversation instanceof Conversation) {
                return $existingConversation;
            }

            /** @var Conversation $conversation */
            $conversation = $this->create([
                'type' => ConversationTypeEnum::PRIVATE->value,
            ]);

            ConversationParticipant::query()->insert([
                [
                    'conversation_id' => $conversation->id,
                    'user_id' => $firstUserId,
                    'last_read_at' => now(),
                ],
                [
                    'conversation_id' => $conversation->id,
                    'user_id' => $secondUserId,
                    'last_read_at' => null,
                ],
            ]);

            return $conversation;
        });
    }

    public function getByParticipant(int $userId, array $filters): LengthAwarePaginator
    {
        $filterCollection = collect($filters);
        $perPage = (int) $filterCollection->get('per_page', config('const.pagination.default_per_page', 10));

        return $this->query()
            ->select('conversations.*')
            ->selectSub(function ($query) use ($userId): void {
                $query->from('messages')
                    ->join('conversation_participants as cp', function ($join) use ($userId): void {
                        $join->on('cp.conversation_id', '=', 'messages.conversation_id')
                            ->where('cp.user_id', '=', $userId);
                    })
                    ->whereColumn('messages.conversation_id', 'conversations.id')
                    ->where('messages.sender_id', '!=', $userId)
                    ->where(function ($unreadQuery): void {
                        $unreadQuery->whereNull('cp.last_read_at')
                            ->orWhereColumn('messages.created_at', '>', 'cp.last_read_at');
                    })
                    ->selectRaw('COUNT(*)');
            }, 'unread_count')
            ->forParticipant($userId)
            ->with([
                'participants' => fn ($participantQuery) => $participantQuery
                    ->select('users.*')
                    ->with('avatarFile'),
                'latestMessage' => fn ($latestMessageQuery) => $latestMessageQuery
                    ->with([
                        'sender' => fn ($senderQuery) => $senderQuery->select('users.*')->with('avatarFile'),
                        'medias.uploadFile',
                        'replyTo',
                    ]),
            ])
            ->orderByDesc(
                Message::query()
                    ->select('created_at')
                    ->whereColumn('messages.conversation_id', 'conversations.id')
                    ->latest('created_at')
                    ->limit(1)
            )
            ->orderByDesc('updated_at')
            ->paginate($perPage);
    }

    public function countUnreadByParticipant(int $userId): int
    {
        return (int) DB::table('messages')
            ->join('conversation_participants as cp', function ($join) use ($userId): void {
                $join->on('cp.conversation_id', '=', 'messages.conversation_id')
                    ->where('cp.user_id', '=', $userId);
            })
            ->where('messages.sender_id', '!=', $userId)
            ->where(function ($query): void {
                $query->whereNull('cp.last_read_at')
                    ->orWhereColumn('messages.created_at', '>', 'cp.last_read_at');
            })
            ->count();
    }
}
