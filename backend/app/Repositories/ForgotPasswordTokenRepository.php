<?php
namespace App\Repositories;

use App\Models\ForgotPasswordToken;
use App\Repositories\BaseRepository;
use Illuminate\Support\Collection;

class ForgotPasswordTokenRepository extends BaseRepository
{


    /**
     * ForgotPasswordTokenRepository constructor.
     */
    public function __construct()
    {
        $modelInstance = app()->make(ForgotPasswordToken::class);
        parent::__construct($modelInstance);
    }

    /**
     * Find forgot password tokens by user ID
     *
     * @param int $userId
     * @return Collection|null
     */
    public function findByUserId(int $userId): Collection|null
    {
        return $this->query()->where('user_id', $userId)->get();
    }

    /**
     * Delete forgot password tokens by user ID
     *
     * @param int $userId
     * @return int
     */
    public function deleteByUserId(int $userId): int
    {
        return $this->query()->where('user_id', $userId)->delete();
    }

    /**
     * Find a forgot password token by token string
     *
     * @param string $token
     * @return ForgotPasswordToken|null
     */
    public function findByToken(string $token): ?ForgotPasswordToken
    {
        return $this->query()->get()->first(fn($item) => $item->isValidToken($token));
    }
}
