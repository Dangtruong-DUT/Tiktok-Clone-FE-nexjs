<?php
namespace App\Repositories;

use App\Models\Relationship;
use App\Repositories\BaseRepository;
use Illuminate\Support\Collection;

class RelationshipRepository  extends BaseRepository
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
     * Find a relationship by user ID
     *
     * @param int $id
     * @return Collection|null
     */
    public function findByUserId(int $id): Collection|null
    {
        return $this->query()->where('user_id', $id)->get();
    }

    /**
     * Delete relationships by user ID
     *
     * @param int $userId
     * @param int $targetUserId
     * @return int
     */
    public function deleteRelationship(int $userId, int $targetUserId): int
    {
        return $this->query()->where('user_id', $userId)->where('target_user_id', $targetUserId)->delete();
    }

    /**
     * Find a refresh token by token string
     *
     * @param int $userId
     * @param int $targetUserId
     * @return bool the relationship exists or not
     */
    public function isExistRelationship(int $userId, int $targetUserId): bool
    {
        return $this->query()->where('user_id', $userId)->where('target_user_id', $targetUserId)->exists();
    }
}
