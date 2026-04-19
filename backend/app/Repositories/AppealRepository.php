<?php

namespace App\Repositories;

use App\Enums\Appeal\AppealStatusEnum;
use App\Models\Appeal;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class AppealRepository extends BaseRepository
{
    /**
     * AppealRepository constructor.
     */
    public function __construct()
    {
        parent::__construct(app()->make(Appeal::class));
    }

    /**
     * Find an appeal by ID
     * @param int $id
     * @return Appeal|null
     */
    public function findById(int $id): ?Appeal
    {
        return $this->find($id);
    }

    /**
     * Find an appeal by UUID
     * @param string $uuid
     * @return Appeal|null
     */
    public function findByUuid(string $uuid): ?Appeal
    {
        return $this->query()->where('uuid', $uuid)->first();
    }

    /**
     * Check if an appeal exists by ID
     * @param int $id
     * @return bool
     */
    public function isExistById(int $id): bool
    {
        return $this->query()->where('id', $id)->exists();
    }

    /**
    * Check if an appeal exists by UUID
    * @param string $uuid
    * @return bool
    */
    public function isExistByUuid(string $uuid): bool
    {
        return $this->query()->where('uuid', $uuid)->exists();
    }

    /**
     * Check if a user has a pending appeal for a specific resource and type
     * @param int $userId
     * @param string $appealType
     * @param int|null $resourceId
     * @return bool
     */
    public function hasPendingAppeal(int $userId, string $appealType, ?int $resourceId): bool
    {
        return $this->query()
            ->byUser($userId)
            ->byStatus(AppealStatusEnum::PENDING)
            ->where('resource_id', $resourceId ??0)
            ->where('appeal_type', $appealType)
            ->exists();
    }

    /**
     * Get appeals for a user with optional filters
     *
     * @param int $userId
     * @param array<string,mixed> $filters
     *                     - appeal_status: string (optional)
     *                     - appeal_type: string (optional)
     *                     - order_by: string 'recent'|'oldest' (optional, default 'recent')
     * @return LengthAwarePaginator
     */
    public function getByUser(int $userId, array $filters): LengthAwarePaginator
    {
        $filterCollection = collect($filters);
        $query =$this
                ->buildSearchQuery($filters)
                ->byUser($userId)
                ->when($filterCollection->get('order_by'),function (Builder $query, $orderBy) {
                    $query->orderByMultiple($orderBy);
                },
                function (Builder $query) {
                    $query->orderBy('created_at', 'desc');
                });
        return $query->paginate((int) $filterCollection->get('per_page', 15));
    }

    /**
     * Get all appeals for admin view with optional filters
     *
     * @param array<string,mixed> $filters
     *                   - status: string (optional)
     *                   - appeal_type: string (optional)
     *                   - sort_by: string 'recent'|'oldest' (optional, default 'recent')
     */
    public function getForAdmin(array $filters): LengthAwarePaginator
    {
        $filterCollection = collect($filters);
        $query = $this->buildSearchQuery($filters)
        ->when($filterCollection->get('order_by'),function (Builder $query, $orderBy) {
            $query->orderByMultiple($orderBy);
        },
        function (Builder $query) {
            $query->orderBy('created_at', 'desc');
        });

        return $query
            ->with(['user', 'reviewer'])
            ->paginate((int) $filterCollection->get('per_page', 20));
    }

    /**
     * Build search query for appeals with filters
     * @param array<string,mixed> $filters
     *                            -  appeal_status: string (optional)
     *                            -  appeal_type: string (optional)
     * @return Builder
     */
    private function buildSearchQuery(array $filters): Builder
    {
        $filterCollection = collect($filters);
        $query = $this->query()
            ->when($filterCollection->get("appeal_status"), function ($query, $appeal_status) {
                $query->where('status', $appeal_status);
            }, function ($query) {
                $query->pending();
            })
            ->when($filterCollection->get("appeal_type"), function ($query, $appeal_type) {
                $query->where('appeal_type', $appeal_type);
            });

        return $query;
    }
}
