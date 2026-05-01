<?php

namespace App\Repositories;

use App\Models\ForgotPasswordToken;

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
     */
    public function deleteByUserId(int $userId): int
    {
        return $this->query()->where('user_id', $userId)->delete();
    }

    /**
     * Find a forgot password token by token fingerprint
     */
    public function findByTokenFingerprint(string $tokenFingerprint): ?ForgotPasswordToken
    {
        return $this->query()->where('token_fingerprint', $tokenFingerprint)->first();
    }
}
