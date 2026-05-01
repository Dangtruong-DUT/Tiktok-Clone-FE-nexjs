<?php

namespace App\Repositories;

use App\Models\AppealToken;

class AppealTokenRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(app()->make(AppealToken::class));
    }

    /**
     * Find by token
     *
     * @param  string  $token
     * @return AppealToken|null
     */
    public function findByToken(string $token): ?AppealToken
    {
        return $this->query()
            ->where('token', $token)
            ->where('expires_at', '>', now())
            ->first();
    }

    /**
     * Find by tokenOrFail
     *
     * @param  string  $token
     * @return AppealToken
     */
    public function findByTokenOrFail(string $token): AppealToken
    {
        return $this->query()
            ->where('token', $token)
            ->where('expires_at', '>', now())
            ->firstOrFail();
    }
}
