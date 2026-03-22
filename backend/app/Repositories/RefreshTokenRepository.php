<?php
namespace App\Repositories;

use App\Models\RefreshToken;
use App\Repositories\BaseRepository;
use Illuminate\Support\Collection;

class RefreshTokenRepository extends BaseRepository
{


    /**
     * RefreshTokenRepository constructor.
     */
    public function __construct()
    {
        $modelInstance = app()->make(RefreshToken::class);
        parent::__construct($modelInstance);
    }
    /**
     * Find a refresh token by token string
     *
     * @param string $token
     * @return RefreshToken|null
     */
    public function findByToken(string $token): RefreshToken|null
    {
        return $this->query()->get()->first(fn($refreshToken) => $refreshToken->isValidToken($token));
    }

    /**
     * Find a refresh token by user ID
     *
     * @param int $userId
     * @return Collection|null
     */
    public function findByUserId(int $userId): Collection|null
    {
        return $this->query()->where('user_id', $userId)->get();
    }

    /**
     * Delete refresh tokens by user ID
     *
     * @param int $userId
     * @return int
     */
    public function deleteByUserId(int $userId): int
    {
        return $this->query()->where('user_id', $userId)->delete();
    }
}
