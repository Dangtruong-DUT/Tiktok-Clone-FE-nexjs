<?php

namespace App\Repositories;

use App\Models\EmailVerifyToken;

class VerifyEmailTokenRepository extends BaseRepository
{
    public function __construct()
    {
        $modelInstance = app()->make(EmailVerifyToken::class);
        parent::__construct($modelInstance);
    }

    /**
     * Delete verify email tokens by user ID.
     * @return int Number of deleted rows
     */
    public function deleteByUserId(int $userId): int
    {
        return $this->query()->where('user_id', $userId)->delete();
    }

    /**
     * Find a verify email token by token hash
     */
    public function findByTokenHash(string $tokenHash): ?EmailVerifyToken
    {
        return $this->query()->where('token_hash', $tokenHash)->first();
    }
}
