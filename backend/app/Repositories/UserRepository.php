<?php
namespace App\Repositories;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

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
}
?>
