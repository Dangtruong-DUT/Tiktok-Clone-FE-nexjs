<?php

namespace App\Services\Admin;

use App\Enums\Ai\ScheduledPostSourceEnum;
use App\Enums\Ai\ScheduledPostStatusEnum;
use App\Models\ScheduledPost;
use App\Repositories\ScheduledPostRepository;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ScheduledPostAdminService
{
    /**
     * Create a new service instance.
     *
     * @param  ScheduledPostRepository  $repository
     */
    public function __construct(
        private readonly ScheduledPostRepository $repository,
    ) {}

    /**
     * Get aggregated scheduled-post metrics for the requested period.
     *
     * @param  string|null  $period
     * @return array<string,mixed>
     */
    public function getMetrics(?string $period = null): array
    {
        $period ??= 'today';

        $from = match ($period) {
            'week'  => now()->subWeek(),
            'month' => now()->subMonth(),
            default => now()->startOfDay(),
        };

        $base      = ScheduledPost::where('created_at', '>=', $from);
        $total     = (clone $base)->count();
        $pending   = (clone $base)->where('status', ScheduledPostStatusEnum::PENDING)->count();
        $published = (clone $base)->where('status', ScheduledPostStatusEnum::PUBLISHED)->count();
        $failed    = (clone $base)->where('status', ScheduledPostStatusEnum::FAILED)->count();
        $cancelled = (clone $base)->where('status', ScheduledPostStatusEnum::CANCELLED)->count();
        $manual    = (clone $base)->where('source', ScheduledPostSourceEnum::MANUAL)->count();
        $calendar  = (clone $base)->where('source', ScheduledPostSourceEnum::CALENDAR)->count();

        // Average publish delay (scheduled_at → published_at) for successfully published posts
        $avgDelay = DB::table('scheduled_posts')
            ->where('created_at', '>=', $from)
            ->where('status', ScheduledPostStatusEnum::PUBLISHED->value)
            ->whereNotNull('published_at')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (published_at - scheduled_at)) / 60) AS avg_delay_minutes')
            ->value('avg_delay_minutes');

        return [
            'period'              => $period,
            'total'               => $total,
            'pending'             => $pending,
            'published'           => $published,
            'failed'              => $failed,
            'cancelled'           => $cancelled,
            'success_rate'        => ($published + $failed) > 0
                ? round($published / ($published + $failed) * 100, 1)
                : null,
            'avg_delay_minutes'   => $avgDelay !== null ? round((float) $avgDelay, 1) : null,
            'by_source'           => [
                'manual'   => $manual,
                'calendar' => $calendar,
            ],
            'daily_series'        => $this->dailySeries($from),
            'top_schedulers'      => $this->topSchedulers($from, 5),
        ];
    }

    /**
     * Get paginated scheduled-post requests for the admin area.
     *
     * @param  array<string,mixed>  $filters
     * @return LengthAwarePaginator<int,ScheduledPost>
     */
    public function listRequests(array $filters): LengthAwarePaginator
    {
        $query = ScheduledPost::with(['user', 'post'])
            ->orderByDesc('scheduled_at');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['source'])) {
            $query->where('source', $filters['source']);
        }

        if (! empty($filters['user_uuid'])) {
            $query->whereHas('user', fn ($q) => $q->where('uuid', $filters['user_uuid']));
        }

        if (! empty($filters['date_from'])) {
            $query->where('scheduled_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (! empty($filters['date_to'])) {
            $query->where('scheduled_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        return $query->paginate((int) ($filters['per_page'] ?? 20));
    }

    /**
     * Force-cancel a scheduled post from the admin area.
     *
     * @param  ScheduledPost  $scheduledPost
     * @return ScheduledPost
     */
    public function forceCancel(ScheduledPost $scheduledPost): ScheduledPost
    {
        if ($scheduledPost->status->isTerminal()) {
            throw new \RuntimeException('Schedule is already in a terminal state.');
        }

        $scheduledPost->post?->update(['status' => \App\Enums\Post\PostPublishStatusEnum::DRAFT]);

        /** @var ScheduledPost */
        $updated = $this->repository->update($scheduledPost->id, [
            'status'        => ScheduledPostStatusEnum::CANCELLED,
            'error_message' => 'Cancelled by admin.',
        ]);

        return $updated;
    }

    /**
     * Force-retry a failed scheduled post from the admin area.
     *
     * @param  ScheduledPost  $scheduledPost
     * @return ScheduledPost
     */
    public function forceRetry(ScheduledPost $scheduledPost): ScheduledPost
    {
        if ($scheduledPost->status !== ScheduledPostStatusEnum::FAILED) {
            throw new \RuntimeException('Only failed schedules can be retried.');
        }

        $scheduledPost->post?->update(['status' => \App\Enums\Post\PostPublishStatusEnum::SCHEDULED]);

        /** @var ScheduledPost */
        $updated = $this->repository->update($scheduledPost->id, [
            'status'        => ScheduledPostStatusEnum::PENDING,
            'error_message' => null,
        ]);

        return $updated;
    }

    /**
     * Find a scheduled post by UUID for the admin area.
     *
     * @param  string  $uuid
     * @return ScheduledPost
     */
    public function findByUuid(string $uuid): ScheduledPost
    {
        return ScheduledPost::where('uuid', $uuid)->with(['user', 'post'])->firstOrFail();
    }

    /** @return array<int,array<string,mixed>> */
    private function dailySeries(Carbon $from): array
    {
        return DB::table('scheduled_posts')
            ->where('created_at', '>=', $from)
            ->selectRaw("
                DATE(scheduled_at)                                           AS date,
                COUNT(*)                                                     AS total,
                SUM(CASE WHEN status = 'published'  THEN 1 ELSE 0 END)      AS published,
                SUM(CASE WHEN status = 'failed'     THEN 1 ELSE 0 END)      AS failed,
                SUM(CASE WHEN status = 'cancelled'  THEN 1 ELSE 0 END)      AS cancelled,
                SUM(CASE WHEN status = 'pending'    THEN 1 ELSE 0 END)      AS pending
            ")
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

    /** @return array<int,array<string,mixed>> */
    private function topSchedulers(Carbon $from, int $limit): array
    {
        return DB::table('scheduled_posts AS sp')
            ->join('users AS u', 'u.id', '=', 'sp.user_id')
            ->where('sp.created_at', '>=', $from)
            ->selectRaw('u.uuid, u.username, u.name, COUNT(*) AS total, SUM(CASE WHEN sp.status = ? THEN 1 ELSE 0 END) AS published', [
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
