<?php

namespace App\Repositories;

use App\Enums\Appeal\AppealStatusEnum;
use App\Models\Appeal;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class AppealRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(app()->make(Appeal::class));
    }

    /**
     * Find an appeal by UUID
     *
     * @param  string  $uuid
     * @return Appeal|null
     */
    public function findByUuid(string $uuid): ?Appeal
    {
        return $this->query()->where('uuid', $uuid)->first();
    }

    /**
     * Check if an appeal exists by ID
     *
     * @param  int  $id
     * @return bool
     */
    public function isExistById(int $id): bool
    {
        return $this->query()->whereKey($id)->exists();
    }

    /**
     * Check if an appeal exists by UUID
     *
     * @param  string  $uuid
     * @return bool
     */
    public function isExistByUuid(string $uuid): bool
    {
        return $this->query()->where('uuid', $uuid)->exists();
    }

    /**
     * Check if a user has a pending appeal for a specific resource and type.
     *
     * @param  int  $userId
     * @param  string  $appealType
     * @param  string  $resourceType
     * @param  int|null  $resourceId
     * @return bool
     */
    public function hasPendingAppeal(
        int $userId,
        string $appealType,
        string $resourceType,
        ?int $resourceId
    ): bool {
        return $this->findPendingAppeal($userId, $appealType, $resourceType, $resourceId) !== null;
    }

    /**
     * Find an existing pending appeal for the same resource and type.
     * Returns the appeal model (with uuid) so it can be surfaced to the user.
     *
     * @param  int  $userId
     * @param  string  $appealType
     * @param  string  $resourceType
     * @param  int|null  $resourceId
     * @return Appeal|null
     */
    public function findPendingAppeal(
        int $userId,
        string $appealType,
        string $resourceType,
        ?int $resourceId
    ): ?Appeal {
        return $this->query()
            ->byUser($userId)
            ->byStatus(AppealStatusEnum::PENDING)
            ->where('appeal_type', $appealType)
            ->where('resource_type', $resourceType)
            ->when(
                $resourceId !== null,
                fn ($query) => $query->where('resource_id', $resourceId),
                fn ($query) => $query->whereNull('resource_id')
            )
            ->first();
    }

    /**
     * Check if a user already has ANY appeal (regardless of status) for a specific resource and type.
     * Once an appeal exists, user must edit it — not create a new one.
     *
     * @param  int|null  $userId
     * @param  string  $appealType
     * @param  string  $resourceType
     * @param  int|null  $resourceId
     * @return bool
     */
    public function hasAppealForResource(
        ?int $userId,
        string $appealType,
        string $resourceType,
        ?int $resourceId
    ): bool {
        return $this->query()
            ->when($userId, fn ($q) => $q->byUser($userId))
            ->where('appeal_type', $appealType)
            ->where('resource_type', $resourceType)
            ->when(
                $resourceId !== null,
                fn ($query) => $query->where('resource_id', $resourceId),
                fn ($query) => $query->whereNull('resource_id')
            )
            ->exists();
    }

    /**
     * Get appeals for a user with optional filters.
     *
     * @param  int  $userId
     * @param  array<string,mixed>  $filters
     * @return LengthAwarePaginator
     */
    public function getByUser(int $userId, array $filters): LengthAwarePaginator
    {
        $filterCollection = collect($filters);
        $query = $this
            ->buildSearchQuery($filterCollection)
            ->byUser($userId)
            ->when($filterCollection->get('order_by'), function (Builder $query, $orderBy) {
                $query->orderByMultiple($orderBy);
            }, function (Builder $query) {
                $query->orderBy('created_at', 'desc');
            });

        $perPage = min((int) $filterCollection->get('per_page', 15), 100);

        return $query
            ->with([
                'user:id,uuid,username,name,avatar_file_id',
                'user.avatarFile:id,file_path,disk',
                'reviewer:id,uuid,username,name,avatar_file_id',
                'reviewer.avatarFile:id,file_path,disk',
            ])
            ->paginate($perPage);
    }

    /**
     * Get all appeals for admin view with optional filters.
     *
     * @param  array<string,mixed>  $filters
     * @return LengthAwarePaginator
     */
    public function getForAdmin(array $filters): LengthAwarePaginator
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
            ->with([
                'user:id,uuid,username,name,avatar_file_id',
                'user.avatarFile:id,file_path,disk',
                'reviewer:id,uuid,username,name,avatar_file_id',
                'reviewer.avatarFile:id,file_path,disk',
            ])
            ->paginate($perPage);
    }

    /**
     * Count appeals with the given status.
     */
    public function countByStatus(AppealStatusEnum $status): int
    {
        return $this->buildSlaBaseQuery($status)->count();
    }

    /**
     * Get the created_at timestamp of the oldest appeal with the given status.
     */
    public function getOldestCreatedAt(AppealStatusEnum $status): ?string
    {
        return $this->buildSlaBaseQuery($status)
            ->orderBy('created_at')
            ->value('created_at');
    }

    /**
     * Get average resolution time in hours for resolved appeals.
     * When $from/$to are supplied, filters to appeals resolved within that window.
     *
     * @param  AppealStatusEnum[]  $resolvedStatuses
     */
    public function getAvgResolutionHours(array $resolvedStatuses, ?Carbon $from = null, ?Carbon $to = null): ?float
    {
        $statuses = array_map(fn (AppealStatusEnum $s) => $s->value, $resolvedStatuses);

        $query = $this->query()
            ->whereIn('status', $statuses)
            ->whereNotNull('resolved_at');

        if ($from !== null && $to !== null) {
            $query->whereBetween('resolved_at', [$from, $to]);
        }

        $result = $query
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as avg_hours')
            ->value('avg_hours');

        return $result !== null ? round((float) $result, 1) : null;
    }

    /**
     * Base query filtered by a single appeal status (shared by SLA analytics methods).
     */
    private function buildSlaBaseQuery(AppealStatusEnum $status): Builder
    {
        return $this->query()->byStatus($status);
    }

    /**
     * Build search query for appeals with filters.
     *
     * @param  Collection<string,mixed>  $filterCollection
     * @return Builder
     */
    private function buildSearchQuery(Collection $filterCollection): Builder
    {
        $keyword = trim((string) $filterCollection->get('q', ''));

        return $this->query()
            ->when($keyword !== '', function (Builder $query) use ($keyword) {
                $like = '%'.$keyword.'%';

                $query->where(function (Builder $searchQuery) use ($like) {
                    $searchQuery
                        ->where('reason', 'ilike', $like)
                        ->orWhereRaw('CAST(uuid AS TEXT) ILIKE ?', [$like])
                        ->orWhere('appeal_type', 'ilike', $like)
                        ->orWhere('resource_type', 'ilike', $like)
                        ->orWhere('status', 'ilike', $like);
                });
            })
            ->when($filterCollection->get('appeal_status'), function (Builder $query, $appealStatus) {
                $query->where('status', $appealStatus);
            })
            ->when($filterCollection->get('appeal_type'), function (Builder $query, $appealType) {
                $query->where('appeal_type', $appealType);
            });
    }
}
