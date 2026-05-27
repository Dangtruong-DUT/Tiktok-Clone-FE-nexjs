<?php

namespace App\Repositories;

use App\Enums\Appeal\AppealStatusEnum;
use App\Models\Appeal;
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
     */
    public function findByUuid(string $uuid): ?Appeal
    {
        return $this->query()->where('uuid', $uuid)->first();
    }

    /**
     * Check if an appeal exists by ID
     */
    public function isExistById(int $id): bool
    {
        return $this->query()->whereKey($id)->exists();
    }

    /**
     * Check if an appeal exists by UUID
     */
    public function isExistByUuid(string $uuid): bool
    {
        return $this->query()->where('uuid', $uuid)->exists();
    }

    /**
     * Check if a user has a pending appeal for a specific resource and type.
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
     * @param  array<string,mixed>  $filters
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
     * @param  array<string,mixed>  $filters
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
     * Build search query for appeals with filters.
     * @param  Collection<string,mixed>  $filterCollection
     */
    private function buildSearchQuery(Collection $filterCollection): Builder
    {
        return $this->query()
            ->when($filterCollection->get('appeal_status'), function (Builder $query, $appealStatus) {
                $query->where('status', $appealStatus);
            })
            ->when($filterCollection->get('appeal_type'), function (Builder $query, $appealType) {
                $query->where('appeal_type', $appealType);
            });
    }
}
