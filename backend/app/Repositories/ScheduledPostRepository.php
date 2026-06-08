<?php

namespace App\Repositories;

use App\Enums\Ai\ScheduledPostSourceEnum;
use App\Enums\Ai\ScheduledPostStatusEnum;
use App\Models\ScheduledPost;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
/**
 * @extends BaseRepository<ScheduledPost>
 */
class ScheduledPostRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(app()->make(ScheduledPost::class));
    }

    /**
     * Find a scheduled post by UUID for a user or fail.
     *
     * @param  string  $uuid
     * @param  int  $userId
     * @return ScheduledPost
     */
    public function findByUuidAndUserOrFail(string $uuid, int $userId): ScheduledPost
    {
        /** @var ScheduledPost */
        return $this->query()
            ->where('uuid', $uuid)
            ->where('user_id', $userId)
            ->firstOrFail();
    }

    /**
     * Paginate scheduled posts for a user.
     *
     * @param  int  $userId
     * @param  int  $perPage
     * @return LengthAwarePaginator
     */
    public function paginateByUser(int $userId, int $perPage): LengthAwarePaginator
    {
        return $this->query()
            ->where('user_id', $userId)
            ->with(['post'])
            ->orderBy('scheduled_at')
            ->paginate($perPage);
    }

    /**
     * Returns all pending scheduled posts due for publishing.
     *
     * @return Collection<int, ScheduledPost>
     */
    public function getDueForPublishing(): Collection
    {
        return $this->query()
            ->where('status', ScheduledPostStatusEnum::PENDING->value)
            ->where('scheduled_at', '<=', now())
            ->get();
    }

    /**
     * Find a pending scheduled post for a user's post.
     *
     * @param  int  $postId
     * @param  int  $userId
     * @return ScheduledPost|null
     */
    public function findByPostForUser(int $postId, int $userId): ?ScheduledPost
    {
        /** @var ScheduledPost|null */
        return $this->query()
            ->where('post_id', $postId)
            ->where('user_id', $userId)
            ->where('status', ScheduledPostStatusEnum::PENDING->value)
            ->first();
    }

    /**
     * Aggregate status/source counts and avg publish delay in a single query.
     *
     * @param  Carbon  $from
     * @return object
     */
    public function getMetricsSummary(Carbon $from): object
    {
        return $this->query()
            ->where('created_at', '>=', $from)
            ->selectRaw('
                COUNT(*) AS total,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS published,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS failed,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS cancelled,
                SUM(CASE WHEN source = ? THEN 1 ELSE 0 END) AS manual,
                SUM(CASE WHEN source = ? THEN 1 ELSE 0 END) AS calendar,
                AVG(CASE WHEN status = ? AND published_at IS NOT NULL
                    THEN EXTRACT(EPOCH FROM (published_at - scheduled_at)) / 60
                    ELSE NULL END) AS avg_delay_minutes
            ', [
                ScheduledPostStatusEnum::PENDING->value,
                ScheduledPostStatusEnum::PUBLISHED->value,
                ScheduledPostStatusEnum::FAILED->value,
                ScheduledPostStatusEnum::CANCELLED->value,
                ScheduledPostSourceEnum::MANUAL->value,
                ScheduledPostSourceEnum::CALENDAR->value,
                ScheduledPostStatusEnum::PUBLISHED->value,
            ])
            ->first();
    }

    /**
     * Daily breakdown of scheduled-post counts grouped by scheduled_at date.
     *
     * @param  Carbon  $from
     * @return array<int,array<string,mixed>>
     */
    public function getDailySeries(Carbon $from): array
    {
        return $this->query()
            ->where('created_at', '>=', $from)
            ->selectRaw('
                DATE(scheduled_at) AS date,
                COUNT(*) AS total,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS published,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS failed,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS cancelled,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS pending
            ', [
                ScheduledPostStatusEnum::PUBLISHED->value,
                ScheduledPostStatusEnum::FAILED->value,
                ScheduledPostStatusEnum::CANCELLED->value,
                ScheduledPostStatusEnum::PENDING->value,
            ])
            ->groupByRaw('DATE(scheduled_at)')
            ->orderByRaw('DATE(scheduled_at)')
            ->get()
            ->map(fn ($row) => [
                'date'      => $row->date,
                'total'     => (int) $row->total,
                'published' => (int) $row->published,
                'failed'    => (int) $row->failed,
                'cancelled' => (int) $row->cancelled,
                'pending'   => (int) $row->pending,
            ])
            ->toArray();
    }

    /**
     * Top N users ranked by number of scheduled posts in the period.
     *
     * @param  Carbon  $from
     * @param  int  $limit
     * @return array<int,array<string,mixed>>
     */
    public function getTopSchedulers(Carbon $from, int $limit): array
    {
        return $this->query()
            ->join('users AS u', 'u.id', '=', 'scheduled_posts.user_id')
            ->where('scheduled_posts.created_at', '>=', $from)
            ->selectRaw('u.uuid, u.username, u.name, COUNT(*) AS total, SUM(CASE WHEN scheduled_posts.status = ? THEN 1 ELSE 0 END) AS published', [
                ScheduledPostStatusEnum::PUBLISHED->value,
            ])
            ->groupBy('u.id', 'u.uuid', 'u.username', 'u.name')
            ->orderByRaw('COUNT(*) DESC')
            ->limit($limit)
            ->get()
            ->map(fn ($row) => [
                'uuid'      => $row->uuid,
                'username'  => $row->username,
                'name'      => $row->name,
                'total'     => (int) $row->total,
                'published' => (int) $row->published,
            ])
            ->toArray();
    }
}
