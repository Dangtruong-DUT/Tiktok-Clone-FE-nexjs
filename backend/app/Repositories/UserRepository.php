<?php
namespace App\Repositories;

use App\Enums\User\RoleTypeEnum;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class UserRepository extends BaseRepository
{

    public function __construct()
    {
        $modelInstance = app()->make(User::class);
        parent::__construct($modelInstance);
    }

    /**
     * Check if user exists
     *
     * @param int $id
     * @return bool
     */
    public function isExist(int $id): bool
    {
        return $this->query()->where('id', $id)->exists();
    }

    public function isExistByUsername(string $username): bool
    {
        return $this->query()->where('username', $username)->exists();
    }

    /**
     * Check if user exists by uuid
     *
     * @param string $uuid
     * @return bool
     */
    public function isExistByUuid(string $uuid): bool
    {
        return $this->query()->where('uuid', $uuid)->exists();
    }

    /**
     * Find a user by uuid
     *
     * @param string $uuid
     * @return User|null
     */
    public function findByUuid(string $uuid): ?User
    {
        // @phpstan-ignore return.type
        return $this->query()->where('uuid', $uuid)->first();
    }

    /**
     * Find a user by uuid or fail
     *
     * @param string $uuid
     * @return User
     */
    public function findByUuidOrFail(string $uuid): User
    {
        return $this->query()->where('uuid', $uuid)->firstOrFail();
    }

    /**
     * Check if user exists by email
     *
     * @param string $email
     * @return bool
     */
    public function checkExistByEmail(string $email): bool
    {
        return $this->query()->where('email', $email)->exists();
    }

    /**
     * Find a user by email
     *
     * @param string $email
     * @return User|null
     */
    public function findByEmail(string $email): ?User
    {
        return $this->query()->where('email', $email)->first();
    }

    /**
     * Check if user exists by username
     *
     * @param string $username
     * @return bool
     */
    public function checkUsernameExist(string $username): bool
    {
        return $this->query()->where('username', $username)->exists();
    }

    /**
     * Find a user by username
     *
     * @param string $username
     * @return User|null
     */
    public function getByUsernameWithDetail(string $username, ?int $authUserId): ?User
    {
        $query = $this->query()->where('username', $username);
        return $this->withDetail($query, $authUserId)->first();
    }

    /**
     * Search users with filters omit super admin
     *
     * @param array $filters
     *                      - q: search keyword for content and user name
     *                      - page: page number for pagination
     *                      - per_page: number of items per page for pagination
     *                      - verify_status: filter by verification status, value can be: banned, verified, unverified
     *                      - role: filter by role, value can be: user, super_admin
     * @param ?int $authUserId
     * @return LengthAwarePaginator
     */
    public function search(array $filters, ?int $authUserId): LengthAwarePaginator
    {
        $filterCollection = collect($filters);
        $query = $this->buildSearchQuery($filterCollection)
        ->where('role', '!=', RoleTypeEnum::SUPER_ADMIN->value)
        ->orderByDesc('created_at');
        $perPage = $filterCollection->get('per_page', config('const.pagination.default_per_page', 10));
        return $this->withDetail($query, $authUserId)->paginate($perPage);
    }

    /**
     * Get user with details by id.
     * @param Builder<User> $query
     * @param ?int $userId
     * @return Builder<User>
     */
    private function withDetail(Builder $query, ?int $userId): Builder
    {
        return $query
            ->select('users.*')
            ->with(['avatarFile'])
            ->selectSub(function ($query) {
                $query->from('posts')
                    ->selectRaw('COALESCE(SUM(likes_count), 0)')
                    ->whereColumn('posts.user_id', 'users.id');
            }, 'likes_count')
            ->withExists([
                'followers as is_followed' => fn ($fq) => $fq->whereKey($userId),
            ])
            ->selectRaw('users.id = ? as is_owner', [$userId]);
    }

    /**
     * Build search query with filters
     *
     * @param  Collection $filterCollection
     *                      - q: search keyword for content and user name
     *                      - verify_status: filter by verification status, value can be: banned, verified, unverified
     *                      - role: filter by role, value can be: user, super_admin
     * @return Builder
     */
    private function buildSearchQuery(Collection $filterCollection): Builder
    {
        $keyword = trim($filterCollection->get('q', ''));
        $query = $this->query()
        // full-text search
            ->when($keyword !== '', function ($query) use ($keyword) {
                $query->where(function ($searchQuery) use ($keyword) {
                    $searchQuery->whereRaw("
                            search_vector @@ plainto_tsquery('simple', ?)
                        ", [$keyword]);
                    });
            })
            ->when($filterCollection->get('verify_status'), function ($query, $verifyStatus) {
                $query->where('verify', $verifyStatus);
            })
            ->when($filterCollection->get('role'), function ($query, $role) {
                $query->where('role', $role);
            });
        return $query;
    }
}
?>
