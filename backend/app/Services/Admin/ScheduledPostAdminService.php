<?php

namespace App\Services\Admin;

use App\Enums\Ai\ScheduledPostStatusEnum;
use App\Models\ScheduledPost;
use App\Repositories\ScheduledPostRepository;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

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

        $summary   = $this->repository->getMetricsSummary($from);
        $published = (int) $summary->published;
        $failed    = (int) $summary->failed;

        return [
            'period'            => $period,
            'total'             => (int) $summary->total,
            'pending'           => (int) $summary->pending,
            'published'         => $published,
            'failed'            => $failed,
            'cancelled'         => (int) $summary->cancelled,
            'success_rate'      => ($published + $failed) > 0
                ? round($published / ($published + $failed) * 100, 1)
                : null,
            'avg_delay_minutes' => $summary->avg_delay_minutes !== null
                ? round((float) $summary->avg_delay_minutes, 1)
                : null,
            'by_source'         => [
                'manual'   => (int) $summary->manual,
                'calendar' => (int) $summary->calendar,
            ],
            'daily_series'   => $this->repository->getDailySeries($from),
            'top_schedulers' => $this->repository->getTopSchedulers($from, 5),
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

}
