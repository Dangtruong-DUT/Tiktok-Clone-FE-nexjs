<?php

namespace App\Repositories;

use App\Enums\User\RelationshipTypeEnum;
use App\Models\Relationship;

class RelationshipRepository extends BaseRepository
{
    /**
     * RelationshipRepository constructor.
     */
    public function __construct()
    {
        $modelInstance = app()->make(Relationship::class);
        parent::__construct($modelInstance);
    }

    /**
     * Delete relationships by user ID
     */
    public function deleteRelationship(int $userId, int $targetUserId, RelationshipTypeEnum $type): int
    {
        return $this->query()->where('user_id', $userId)
            ->where('target_user_id', $targetUserId)
            ->where('type', $type->value)
            ->delete();
    }

    /**
     * Check if the user is following the target user
     *
     * @return bool the relationship exists or not
     */
    public function isFollowing(int $userId, int $targetUserId): bool
    {
        return $this->query()
            ->where('user_id', $userId)
            ->where('target_user_id', $targetUserId)
            ->where('type', RelationshipTypeEnum::FOLLOW->value)
            ->exists();
    }
}
