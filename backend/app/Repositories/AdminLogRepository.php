<?php

namespace App\Repositories;

use App\Models\AdminLog;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection as SupportCollection;

class AdminLogRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(app()->make(AdminLog::class));
    }

    /**
     * Get paginated admin logs for admin panel.
     * @param  array<string,mixed>  $filters
     */
    public function searchForAdmin(array $filters = []): LengthAwarePaginator
    {
        $filterCollection = collect($filters);

        $query = $this->buildSearchQuery($filterCollection);

        $orderBy = $filterCollection->get('order_by');

        if (is_array($orderBy) && count($orderBy) > 0) {
            $query->orderByMultiple($orderBy);
        } else {
            $query->orderByDesc('created_at');
        }

        $perPage = min((int) $filterCollection->get('per_page', 20), 100);

        return $query
            ->with(['admin:id,uuid,username,avatar_file_id', 'admin.avatarFile:id,file_path,disk'])
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
     * Get actions by admin id.
     */
    public function getActionsByAdminId(int $adminId, int $limit = 50): EloquentCollection
    {
        return $this->query()
            ->byAdmin($adminId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Build search query with filters.
     */
    private function buildSearchQuery(SupportCollection $filterCollection): Builder
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
}
