<?php

namespace App\Repositories;

use App\Models\AdminLog;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class AdminLogRepository extends BaseRepository
{
    /**
     * AdminLogRepository constructor.
     */
    public function __construct()
    {
        parent::__construct(app()->make(AdminLog::class));
    }

    /**
     * Get paginated admin logs for admin panel.
     *
     * @param array<string,mixed> $filters
     */
    public function searchForAdmin(array $filters = []): LengthAwarePaginator
    {
        $filterCollection = collect($filters);

        $query = $this->buildSearchQuery($filterCollection);

        $sortBy = (string) $filterCollection->get('order_by', '-created_at');
        $this->applySort($query, $sortBy);

        $perPage = min((int) $filterCollection->get('per_page', 20), 100);

        return $query
            ->with(['admin:id,uuid,username,avatar_file_id', 'admin.avatarFile:id,url'])
            ->paginate($perPage);
    }

    /**
     * Count admin logs from a given date.
     */
    public function countSince(Carbon $dateFrom): int
    {
        return $this->query()
            ->where('created_at', '>=', $dateFrom)
            ->count();
    }

    /**
     * Build search query with filters.
     *
     * @param Collection $filterCollection
     */
    private function buildSearchQuery(Collection $filterCollection): Builder
    {
        return $this->query()
            ->when($filterCollection->get('action_type'), function (Builder $query, $actionType) {
                $query->where('action', $actionType);
            })
            ->when($filterCollection->get('admin_uuid'), function (Builder $query, $adminUuid) {
                $query->whereHas('admin', fn (Builder $adminQuery) => $adminQuery->where('uuid', $adminUuid));
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
