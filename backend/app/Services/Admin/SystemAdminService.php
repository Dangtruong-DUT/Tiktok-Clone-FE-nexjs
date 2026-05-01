<?php

namespace App\Services\Admin;

use App\Models\Post;
use App\Models\User;
use App\Repositories\ActivityLogRepository;
use App\Repositories\AdminLogRepository;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * SystemAdminService - System monitoring and dashboard operations
 * Handles: activity logs, statistics, audit trail
 */
class SystemAdminService
{
    public function __construct(
        private readonly AdminLogRepository $adminLogRepository,
        private readonly ActivityLogRepository $activityLogRepository,
    ) {}

    /**
     * Get dashboard statistics
     *
     * @param  string  $period  'today'|'week'|'month'|'year'
     * @return array {
     *               total_users: int,
     *               active_users: int,
     *               banned_users: int,
     *               total_posts: int,
     *               deleted_posts: int,
     *               total_comments: int,
     *               total_admin_actions: int
     *               }
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
        ];
    }

    /**
     * Get paginated admin logs with filtering
     *
     * @param  array  $filters  {
     *                          action_type?: string,
     *                          admin_uuid?: string,
     *                          resource_type?: string,
     *                          date_from?: string (Y-m-d),
     *                          date_to?: string (Y-m-d),
     *                          page?: int,
     *                          per_page?: int,
     *                          order_by?: string
     *                          }
     */
    public function getAdminLogs(array $filters = []): LengthAwarePaginator
    {
        return $this->adminLogRepository->searchForAdmin($filters);
    }

    /**
     * Get paginated activity logs with filtering
     *
     * @param  array  $filters  {
     *                          action_type?: string,
     *                          user_uuid?: string,
     *                          resource_type?: string,
     *                          date_from?: string (Y-m-d),
     *                          date_to?: string (Y-m-d),
     *                          page?: int,
     *                          per_page?: int,
     *                          order_by?: string
     *                          }
     */
    public function getActivityLogs(array $filters = []): LengthAwarePaginator
    {
        return $this->activityLogRepository->searchForAdmin($filters);
    }

    /**
     * Validate period parameter
     *
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
