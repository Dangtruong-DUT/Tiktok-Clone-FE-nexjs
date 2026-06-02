<?php

namespace App\Repositories;

use App\Enums\Ai\ScheduledPostStatusEnum;
use App\Models\ScheduledPost;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * @extends BaseRepository<ScheduledPost>
 */
class ScheduledPostRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(new ScheduledPost());
    }

    public function findByUuidAndUserOrFail(string $uuid, int $userId): ScheduledPost
    {
        /** @var ScheduledPost */
        return $this->query()
            ->where('uuid', $uuid)
            ->where('user_id', $userId)
            ->firstOrFail();
    }

    public function paginateByUser(int $userId, int $perPage): LengthAwarePaginator
    {
        return $this->query()
            ->where('user_id', $userId)
            ->with(['post'])
            ->orderBy('scheduled_at')
            ->paginate($perPage);
    }

    /** Returns all pending scheduled posts due for publishing */
    public function getDueForPublishing(): Collection
    {
        return $this->query()
            ->where('status', ScheduledPostStatusEnum::PENDING->value)
            ->where('scheduled_at', '<=', now())
            ->get();
    }

    public function findByPostForUser(int $postId, int $userId): ?ScheduledPost
    {
        /** @var ScheduledPost|null */
        return $this->query()
            ->where('post_id', $postId)
            ->where('user_id', $userId)
            ->where('status', ScheduledPostStatusEnum::PENDING->value)
            ->first();
    }
}
