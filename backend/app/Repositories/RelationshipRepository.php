<?php

namespace App\Repositories;

use App\Enums\User\RelationshipTypeEnum;
use App\Models\Relationship;

class RelationshipRepository extends BaseRepository
{
    public function __construct()
    {
        $modelInstance = app()->make(Relationship::class);
        parent::__construct($modelInstance);
    }

    /**
     * Delete a follow relationship between two users.
     *
     * @param  int  $userId
     * @param  int  $targetUserId
     * @param  RelationshipTypeEnum  $type
     * @return int Number of deleted rows
     */
    public function deleteRelationship(int $userId, int $targetUserId, RelationshipTypeEnum $type): int
    {
        return $this->query()->where('user_id', $userId)
            ->where('target_user_id', $targetUserId)
            ->where('type', $type->value)
            ->delete();
    }

    /**
     * Check if the user is following the target user.
     *
     * @param  int  $userId
     * @param  int  $targetUserId
     * @return bool
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
