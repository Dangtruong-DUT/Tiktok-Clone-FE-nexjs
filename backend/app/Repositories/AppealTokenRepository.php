<?php

namespace App\Repositories;

use App\Models\AppealToken;

class AppealTokenRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(app()->make(AppealToken::class));
    }

    public function findByToken(string $token): ?AppealToken
    {
        return $this->query()->where('token', $token)->first();
    }

    public function findByTokenOrFail(string $token): AppealToken
    {
        return $this->query()->where('token', $token)->firstOrFail();
    }
}
