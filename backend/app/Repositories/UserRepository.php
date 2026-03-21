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
    public function getUserProfileByUuid(string $uuid, ?int $authUserId): ?User
    {
        $query = $this->query()->where('uuid', $uuid);
        return $this->withDetail($query, $authUserId)->first();
    }

    /**
     * Get user with details by uuid.
     *
     * @param string $uuid
     * @param int|null $authUserId
     * @return User|null
     */

    /**
     * Get user with details by id.
     * @param Builder<User> $query
     * @param ?int $userId
     * @return Builder<User>
     */
    private function withDetail(Builder $query, ?int $userId) : Builder
    {
        return $query
            ->withCount([
                'followers as following_count',
                'followers as followers_count',
                'likes as likes_count',
            ])
            ->withExists([
                'followers as is_followed' => fn ($q) => $q->where('follower_id', $userId),
            ]);
    }
}
?>
