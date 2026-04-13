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
     * @param array<string,mixed> $filters
     */
    public function searchForAdmin(array $filters = []): LengthAwarePaginator
    {
        $filterCollection = collect($filters);

        $query = $this->buildSearchQuery($filterCollection);

        $sortBy = (string) $filterCollection->get('sort_by', '-created_at');
        $this->applySort($query, $sortBy);

        $perPage = min((int) $filterCollection->get('per_page', 20), 100);

        return $query
            ->with('user:id,username,avatar_url')
            ->paginate($perPage);
    }

    /**
     * Build search query with filters.
     *
     * @param Collection $filterCollection
     */
    private function buildSearchQuery(Collection $filterCollection): Builder
    {
        return $this->query()
            ->when($filterCollection->get('activity_type'), function (Builder $query, $activityType) {
                $query->where('activity_type', $activityType);
            })
            ->when($filterCollection->get('user_id'), function (Builder $query, $userId) {
                $query->where('user_id', $userId);
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

    /**
     * Apply sorting rule. Prefix '-' means DESC.
     */
    private function applySort(Builder $query, string $sortBy): Builder
    {
        if (str_starts_with($sortBy, '-')) {
            return $query->orderBy(substr($sortBy, 1), 'desc');
        }

        return $query->orderBy($sortBy, 'asc');
    }
}
