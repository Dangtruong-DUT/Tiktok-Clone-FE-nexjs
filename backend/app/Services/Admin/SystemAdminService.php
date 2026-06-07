<?php

namespace App\Services\Admin;

use App\Http\Resources\Api\Admin\System\ActivityLogResource;
use App\Http\Resources\Api\Admin\System\AdminLogResource;
use App\Models\Appeal;
use App\Models\Post;
use App\Models\User;
use App\Repositories\ActivityLogRepository;
use App\Repositories\AdminLogRepository;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

/**
 * Handles: activity logs, statistics, audit trail
 */
class SystemAdminService
{
    /**
     * Create a new service instance.
     *
     * @param  AdminLogRepository  $adminLogRepository
     * @param  ActivityLogRepository  $activityLogRepository
     */
    public function __construct(
        private readonly AdminLogRepository $adminLogRepository,
        private readonly ActivityLogRepository $activityLogRepository,
    ) {}

    /**
     * Get dashboard statistics.
     * @param  'today'|'week'|'month'|'year'  $period
     * @return array{total_users: int, active_users: int, banned_users: int, total_posts: int, deleted_posts: int, total_comments: int, total_admin_actions: int, new_users_this_period: int, new_posts_this_period: int}
     * @throws \InvalidArgumentException
     */
    public function getDashboardStats(string $period = 'today'): array
    {
        $this->validatePeriod($period);

        $dateFrom = $this->getDateFrom($period);

        return [
            'total_users' => User::count(),
            'active_users' => User::whereNull('banned_at')->count(),
            'banned_users' => User::whereNotNull('banned_at')->count(),
            'total_posts' => Post::count(),
            'deleted_posts' => Post::onlyTrashed()->count(),
            'total_comments' => Post::whereNotNull('parent_id')->count(),
            'total_admin_actions' => $this->adminLogRepository->countSince($dateFrom),
            'new_users_this_period' => User::where('created_at', '>=', $dateFrom)->count(),
            'new_posts_this_period' => Post::where('created_at', '>=', $dateFrom)->count(),
            'pending_appeals' => Appeal::where('status', 'pending')->count(),
            'user_daily_series' => $this->getUserDailySeries(7),
            'post_status_counts' => $this->getPostStatusCounts(),
        ];
    }

    /**
     * Get paginated admin logs with filtering.
    * @param  array{action_type?: string, admin_uuid?: string, resource_type?: string, date_from?: string, date_to?: string, page?: int, per_page?: int, order_by?: array<int, string>}  $filters
     */
    public function getAdminLogs(array $filters = []): LengthAwarePaginator
    {
        return $this->adminLogRepository->searchForAdmin($filters);
    }

    /**
     * Get paginated activity logs with filtering.
    * @param  array{action_type?: string, user_uuid?: string, resource_type?: string, date_from?: string, date_to?: string, page?: int, per_page?: int, order_by?: array<int, string>}  $filters
     */
    public function getActivityLogs(array $filters = []): LengthAwarePaginator
    {
        return $this->activityLogRepository->searchForAdmin($filters);
    }

    /**
     * Get admin/activity logs resource collection based on log type.
    * @param  array{log_type?: string, action_type?: string, admin_uuid?: string, user_uuid?: string, resource_type?: string, date_from?: string, date_to?: string, page?: int, per_page?: int, order_by?: array<int, string>}  $filters
     */
    public function getLogsResource(array $filters = []): AnonymousResourceCollection
    {
        $logType = (string) ($filters['log_type'] ?? 'admin');

        if ($logType === 'activity') {
            return ActivityLogResource::collection($this->getActivityLogs($filters));
        }

        return AdminLogResource::collection($this->getAdminLogs($filters));
    }

    /**
     * Returns daily new-user counts for the last N days (oldest-first).
     * @return array<int, array{date: string, count: int}>
     */
    private function getUserDailySeries(int $days = 7): array
    {
        $rows = DB::table('users')
            ->selectRaw("DATE(created_at) as date, COUNT(*) as count")
            ->where('created_at', '>=', now()->subDays($days - 1)->startOfDay())
            ->groupByRaw("DATE(created_at)")
            ->orderBy('date')
            ->pluck('count', 'date');

        $series = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $series[] = ['date' => $date, 'count' => (int) ($rows[$date] ?? 0)];
        }

        return $series;
    }

    /**
     * Returns post counts grouped by publish status.
     * @return array<string, int>
     */
    private function getPostStatusCounts(): array
    {
        $rows = DB::table('posts')
            ->whereNull('deleted_at')
            ->selectRaw("status, COUNT(*) as count")
            ->groupBy('status')
            ->pluck('count', 'status');

        return [
            'published' => (int) ($rows['published'] ?? 0),
            'scheduled' => (int) ($rows['scheduled'] ?? 0),
            'draft'     => (int) ($rows['draft'] ?? 0),
        ];
    }

    /**
     * Validate period parameter
     * @throws \InvalidArgumentException
     */
    private function validatePeriod(string $period): void
    {
        if (! in_array($period, ['today', 'week', 'month', 'year'])) {
            throw new \InvalidArgumentException("Invalid period: {$period}");
        }
    }

    /**
     * Get date from based on period
     */
    private function getDateFrom(string $period): Carbon
    {
        return match ($period) {
            'today' => now()->startOfDay(),
            'week' => now()->subWeek()->startOfDay(),
            'month' => now()->subMonth()->startOfDay(),
            'year' => now()->subYear()->startOfDay(),
        };
    }
}
