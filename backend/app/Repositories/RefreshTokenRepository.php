<?php

namespace App\Repositories;

use App\Models\RefreshToken;

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
     * Find a refresh token by JTI
     */
    public function findByJti(string $jti): ?RefreshToken
    {
        return $this->query()->where('jti', $jti)->first();
    }

    /**
     * Delete refresh tokens by user ID
     */
    public function deleteByUserId(int $userId): int
    {
        return $this->query()->where('user_id', $userId)->delete();
    }
}
