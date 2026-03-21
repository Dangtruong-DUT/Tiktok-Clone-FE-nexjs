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
        return $this->query()->where('token', $token)->first();
    }

    /**
     * Find a refresh token by user ID
     *
     * @param int $id
     * @return Collection|null
     */
    public function findByUserId(int $id): Collection|null
    {
        return $this->query()->where('user_id', $id)->get();
    }

    /**
     * Delete refresh tokens by user ID
     *
     * @param int $id
     * @return int
     */
    public function deleteByUserId(int $id): int
    {
        return $this->query()->where('user_id', $id)->delete();
    }
}
