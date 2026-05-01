<?php

namespace App\Repositories;

use App\Models\ActivityLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class ActivityLogRepository extends BaseRepository
{
    /**
     * ActivityLogRepository constructor.
     */
    public function __construct()
    {
        parent::__construct(app()->make(ActivityLog::class));
    }

    /**
     * Get paginated activity logs for admin panel.
     *
     * @param  array<string,mixed>  $filters
     */
    public function searchForAdmin(array $filters = []): LengthAwarePaginator
    {
        $filterCollection = collect($filters);

        $query = $this->buildSearchQuery($filterCollection)
            ->when($filterCollection->get('order_by'), function (Builder $query, $orderBy) {
                $query->orderByMultiple($orderBy);
            }, function (Builder $query) {
                $query->orderBy('created_at', 'desc');
            });

        $perPage = min((int) $filterCollection->get('per_page', 20), 100);

        return $query
            ->with(['user:id,uuid,username,avatar_file_id', 'user.avatarFile:id,url'])
            ->paginate($perPage);
    }

    /**
     * Build search query with filters.
     */
    private function buildSearchQuery(Collection $filterCollection): Builder
    {
        return $this->query()
            ->when($filterCollection->get('action_type'), function (Builder $query, $activityType) {
                $query->where('activity_type', $activityType);
            })
            ->when($filterCollection->get('user_uuid'), function (Builder $query, $userUuid) {
                $query->whereHas('user', fn (Builder $userQuery) => $userQuery->where('uuid', $userUuid));
            })
            ->when($filterCollection->get('resource_type'), function (Builder $query, $resourceType) {
                $query->where('resource_type', $resourceType);
            })
            ->when($filterCollection->get('date_from'), function (Builder $query, $dateFrom) {
                $query->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($filterCollection->get('date_to'), function (Builder $query, $dateTo) {
                $query->whereDate('created_at', '<=', $dateTo);
            });
    }
}
