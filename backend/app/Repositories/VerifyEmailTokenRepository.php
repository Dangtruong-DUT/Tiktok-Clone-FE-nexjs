<?php

namespace App\Repositories;

use App\Models\EmailVerifyToken;

class VerifyEmailTokenRepository extends BaseRepository
{
    /**
     * VerifyEmailTokenRepository constructor.
     */
    public function __construct()
    {
        $modelInstance = app()->make(EmailVerifyToken::class);
        parent::__construct($modelInstance);
    }

    /**
     * Delete verify email tokens by user ID
     */
    public function deleteByUserId(int $userId): int
    {
        return $this->query()->where('user_id', $userId)->delete();
    }

    /**
     * Find a verify email token by token fingerprint
     */
    public function findByTokenFingerprint(string $tokenFingerprint): ?EmailVerifyToken
    {
        return $this->query()->where('token_fingerprint', $tokenFingerprint)->first();
    }
}
