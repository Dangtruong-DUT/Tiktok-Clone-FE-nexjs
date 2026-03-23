<?php
namespace App\Repositories;

use App\Models\ForgotPasswordToken;
use App\Repositories\BaseRepository;

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
     * Find a forgot password token by token fingerprint
     *
     * @param string $tokenFingerprint
     * @return ForgotPasswordToken|null
     */
    public function findByTokenFingerprint(string $tokenFingerprint): ?ForgotPasswordToken
    {
        return $this->query()->where('token_fingerprint', $tokenFingerprint)->first();
    }
}
