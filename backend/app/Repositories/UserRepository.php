<?php

namespace App\Repositories;

use App\Enums\Post\PostTypeEnum;
use App\Enums\User\RoleTypeEnum;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class UserRepository extends BaseRepository
{
    /**
     * UserRepository constructor.
     */
    public function __construct()
    {
        parent::__construct(app()->make(User::class));
    }

    /**
     * Check if user exists.
     */
    public function isExist(int $id): bool
    {
        return $this->query()->whereKey($id)->exists();
    }

    /**
     * Check if user exists by username.
     */
    public function isExistByUsername(string $username): bool
    {
        return $this->query()->where('username', $username)->exists();
    }

    /**
     * Check if user exists by uuid.
     */
    public function isExistByUuid(string $uuid): bool
    {
        return $this->query()->where('uuid', $uuid)->exists();
    }

    /**
     * Find a user by uuid.
     */
    public function findByUuid(string $uuid): ?User
    {
        // @phpstan-ignore return.type
        return $this->query()->where('uuid', $uuid)->first();
    }

    /**
     * Find a user by uuid or fail.
     */
    public function findByUuidOrFail(string $uuid): User
    {
        return $this->query()->where('uuid', $uuid)->firstOrFail();
    }

    /**
     * Check if user exists by email.
     */
    public function checkExistByEmail(string $email): bool
    {
        return $this->query()->where('email', $email)->exists();
    }

    /**
     * Find a user by email.
     */
    public function findByEmail(string $email): ?User
    {
        return $this->query()->where('email', $email)->first();
    }

    /**
     * Check if user exists by username.
     */
    public function checkUsernameExist(string $username): bool
    {
        return $this->query()->where('username', $username)->exists();
    }

    /**
     * Get user ids by usernames.
     *
     * @param array<int, string> $usernames
     * @return array<int, int>
     */
    public function getIdsByUsernames(array $usernames): array
    {
        if ($usernames === []) {
            return [];
        }

        return $this->query()
            ->whereIn('username', $usernames)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->toArray();
    }

    /**
     * Get map [username => id] for given usernames.
     *
     * @param array<int, string> $usernames
     * @return array<string, int>
     */
    public function getIdMapByUsernames(array $usernames): array
    {
        if ($usernames === []) {
            return [];
        }

        return $this->query()
            ->whereIn('username', $usernames)
            ->pluck('id', 'username')
            ->mapWithKeys(fn ($id, $username) => [(string) $username => (int) $id])
            ->toArray();
    }

    /**
     * Find a user by username.
     */
    public function getByUsernameWithDetail(string $username, ?int $authUserId): ?User
    {
        $query = $this->query()->where('username', $username);

        return $this->withDetail($query, $authUserId)->first();
    }

    /**
     * Search users with filters, omit super admin.
     *
     * @param array<string, mixed> $filters
     */
    public function search(array $filters, ?int $authUserId): LengthAwarePaginator
    {
        $filterCollection = collect($filters);

        $query = $this->buildSearchQuery($filterCollection)
            ->where('role', '!=', RoleTypeEnum::SUPER_ADMIN->value)
            ->orderByDesc('created_at');

        $perPage = (int) $filterCollection->get('per_page', config('const.pagination.default_per_page', 10));

        return $this->withDetail($query, $authUserId)->paginate($perPage);
    }

    /**
     * Get paginated users for admin panel.
     *
     * @param array<string,mixed> $filters
     */
    public function searchForAdmin(array $filters): LengthAwarePaginator
    {
        $filterCollection = collect($filters);

        $query = $this->query()
            ->when($filterCollection->get('q'), function (Builder $query, $search) {
                $query->where(function (Builder $builder) use ($search) {
                    $builder->where('username', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($filterCollection->get('status'), function (Builder $query, $status) {
                if ($status === 'banned') {
                    $query->whereNotNull('banned_at');

                    return;
                }

                if ($status === 'active') {
                    $query->whereNull('banned_at');
                }
            })
            ->when($filterCollection->get('sort_by'), function (Builder $query, $sortBy) {
                if (str_starts_with((string) $sortBy, '-')) {
                    $query->orderBy(substr((string) $sortBy, 1), 'desc');

                    return;
                }

                $query->orderBy((string) $sortBy, 'asc');
            });

        $perPage = (int) $filterCollection->get('per_page', config('const.pagination.default_per_page', 10));

        return $query
            ->select(['id', 'username', 'email', 'avatar_url', 'created_at', 'banned_at', 'ban_reason'])
            ->paginate($perPage);
    }

    /**
     * Get user indicators grouped by date in given range.
        *
        * @param int $userId
        * @param string $fromDate
        * @param string $toDate
        * @return Collection
     */
    public function getIndicatorsByUserIdAndDateRange(int $userId, string $fromDate, string $toDate): Collection
    {
        return DB::table('posts')
            ->where('user_id', $userId)
            ->selectRaw('DATE(created_at) as date')
            ->selectRaw('COALESCE(SUM(likes_count), 0) as likes_count')
            ->selectRaw('COALESCE(SUM(guest_views), 0) as guests_view')
            ->selectRaw('COALESCE(SUM(user_views), 0) as users_view')
            ->selectRaw('COALESCE(SUM(comments_count), 0) as comments_count')
            ->whereDate('created_at', '>=', $fromDate)
            ->whereDate('created_at', '<=', $toDate)
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();
    }

    /**
     * Get followers of target user.
     *
     * @param array<string, mixed> $filters
     */
    public function getFollowersByUserId(int $targetUserId, array $filters, ?int $authUserId): LengthAwarePaginator
    {
        $filterCollection = collect($filters);

        $query = $this->query()
            ->whereHas('followings', fn (Builder $relationQuery) => $relationQuery->whereKey($targetUserId));

        return $this->paginateListWithDetail($query, $filterCollection, $authUserId);
    }

    /**
     * Get followings of target user.
     *
     * @param array<string, mixed> $filters
     */
    public function getFollowingByUserId(int $targetUserId, array $filters, ?int $authUserId): LengthAwarePaginator
    {
        $filterCollection = collect($filters);

        $query = $this->query()
            ->whereHas('followers', fn (Builder $relationQuery) => $relationQuery->whereKey($targetUserId));

        return $this->paginateListWithDetail($query, $filterCollection, $authUserId);
    }

    /**
     * Get mutual friends of target user.
     *
     * @param array<string, mixed> $filters
     */
    public function getFriendsByUserId(int $targetUserId, array $filters, ?int $authUserId): LengthAwarePaginator
    {
        $filterCollection = collect($filters);

        $query = $this->query()
            ->whereHas('followings', fn (Builder $relationQuery) => $relationQuery->whereKey($targetUserId))
            ->whereHas('followers', fn (Builder $relationQuery) => $relationQuery->whereKey($targetUserId));

        return $this->paginateListWithDetail($query, $filterCollection, $authUserId);
    }

    /**
     * Get suggested users for authenticated user.
     *
     * @param array<string, mixed> $filters
     */
    public function getSuggestedUsers(array $filters, ?int $authUserId): LengthAwarePaginator
    {
        $filterCollection = collect($filters);

        $query = $this->query()
            ->where('role', '!=', RoleTypeEnum::SUPER_ADMIN->value)
            ->when($authUserId !== null, function (Builder $query) use ($authUserId) {
                $query->whereKeyNot($authUserId)
                    ->whereDoesntHave('followers', fn (Builder $relationQuery) => $relationQuery->whereKey($authUserId));
            });

        return $this->paginateListWithDetail($query, $filterCollection, $authUserId);
    }

    /**
     * Get user with details by id.
     *
     * @param Builder<User> $query
     * @return Builder<User>
     */
    private function withDetail(Builder $query, ?int $userId): Builder
    {
        return $query
            ->select('users.*')
            ->with(['avatarFile'])
            ->selectSub(function (Builder $subQuery) {
                $subQuery->from('posts')
                    ->where('type', PostTypeEnum::POST->value)
                    ->selectRaw('COALESCE(SUM(likes_count), 0)')
                    ->whereColumn('posts.user_id', 'users.id');
            }, 'likes_count')
            ->withExists([
                'followers as is_followed' => fn (Builder $followersQuery) => $followersQuery->whereKey($userId),
            ])
            ->selectRaw('users.id = ? as is_owner', [$userId]);
    }

    /**
     * Apply list filters and return paginated users with detail.
     *
     * @param Builder<User> $query
        * @param Collection $filterCollection
        * @param ?int $authUserId
        * @return LengthAwarePaginator
     */
    private function paginateListWithDetail(Builder $query, Collection $filterCollection, ?int $authUserId): LengthAwarePaginator
    {
        $keyword = trim((string) $filterCollection->get('q', ''));

        $query
            ->when($keyword !== '', fn (Builder $builder) => $this->applySearchVector($builder, $keyword))
            ->orderByDesc('followers_count')
            ->orderByDesc('created_at');

        $perPage = (int) $filterCollection->get('per_page', config('const.pagination.default_per_page', 10));

        return $this->withDetail($query, $authUserId)->paginate($perPage);
    }

    /**
     * Build search query with filters.
        *
        * @param Collection $filterCollection
        * @return Builder
     */
    private function buildSearchQuery(Collection $filterCollection): Builder
    {
        $keyword = trim((string) $filterCollection->get('q', ''));

        return $this->query()
            ->when($keyword !== '', fn (Builder $query) => $this->applySearchVector($query, $keyword))
            ->when(
                $filterCollection->has('verify_status') && $filterCollection->get('verify_status') !== null,
                fn (Builder $query) => $query->where('verify', (int) $filterCollection->get('verify_status'))
            )
            ->when(
                $filterCollection->has('role') && $filterCollection->get('role') !== null,
                fn (Builder $query) => $query->where('role', (int) $filterCollection->get('role'))
            );
    }

    /**
     * Apply full-text search condition on search_vector.
     *
     * @param Builder $query
     * @param string $keyword
     * @return Builder
     */
    private function applySearchVector(Builder $query, string $keyword): Builder
    {
        return $query->whereRaw(
            "search_vector @@ plainto_tsquery('simple', ?)",
            [$keyword]
        );
    }
}
