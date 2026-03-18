<?php
namespace App\Repositories;

use App\Models\User;

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
}
?>
