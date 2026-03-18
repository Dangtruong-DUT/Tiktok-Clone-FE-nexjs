<?php
namespace App\Repositories;

use App\Models\EmailVerifyToken;
use App\Repositories\BaseRepository;
use Illuminate\Support\Collection;

class VerifyEmailTokenRepository  extends BaseRepository
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

    /**
     * Find a refresh token by token string
     *
     * @param string $token
     * @return EmailVerifyToken|null
     */
    public function findByToken(string $token): ?EmailVerifyToken
    {
        return $this->query()->get()->first(fn($item) => $item->isValidToken($token));
    }
}
