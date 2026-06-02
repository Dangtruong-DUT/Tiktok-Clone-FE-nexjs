<?php

namespace App\Repositories;

use App\Enums\Ai\AiConversationStatusEnum;
use App\Models\AiCreatorConversation;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * @extends BaseRepository<AiCreatorConversation>
 */
class AiCreatorConversationRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(new AiCreatorConversation());
    }

    public function findByUuidAndUserOrFail(string $uuid, int $userId): AiCreatorConversation
    {
        /** @var AiCreatorConversation */
        return $this->query()
            ->where('uuid', $uuid)
            ->where('user_id', $userId)
            ->firstOrFail();
    }

    public function paginateByUser(int $userId, int $perPage): LengthAwarePaginator
    {
        return $this->query()
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function findActiveForUser(int $userId): ?AiCreatorConversation
    {
        /** @var AiCreatorConversation|null */
        return $this->query()
            ->where('user_id', $userId)
            ->where('status', AiConversationStatusEnum::WAITING_FOR_ANSWER->value)
            ->latest()
            ->first();
    }
}
