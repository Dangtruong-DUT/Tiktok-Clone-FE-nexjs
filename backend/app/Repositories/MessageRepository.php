<?php

namespace App\Repositories;

use App\Models\Message;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MessageRepository extends BaseRepository
{
    public function __construct()
    {
        $modelInstance = app()->make(Message::class);
        parent::__construct($modelInstance);
    }

    public function isExist(int $id): bool
    {
        return $this->query()->where('id', $id)->exists();
    }

    public function getByConversationId(int $conversationId, array $filters): LengthAwarePaginator
    {
        $filterCollection = collect($filters);
        $perPage = (int) $filterCollection->get('per_page', config('const.pagination.default_per_page', 20));

        return $this->query()
            ->inConversation($conversationId)
            ->with([
                'sender' => fn ($senderQuery) => $senderQuery->select('users.*')->with('avatarFile'),
                'medias.uploadFile',
                'replyTo' => fn ($replyQuery) => $replyQuery->with('sender'),
            ])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
