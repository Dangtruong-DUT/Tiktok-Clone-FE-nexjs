<?php
namespace App\Repositories;

use App\Models\RefreshToken;
use App\Repositories\BaseRepository;

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
     *
     * @param string $jti
     * @return RefreshToken|null
     */
    public function findByJti(string $jti): RefreshToken|null
    {
        return $this->query()->where('jti', $jti)->first();
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
