<?php
namespace App\Repositories;

use App\Models\EmailVerifyToken;
use App\Repositories\BaseRepository;
use Illuminate\Support\Collection;

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
     * Find verify email tokens by user ID
     *
     * @param int $userId
     * @return Collection|null
     */
    public function findByUserId(int $userId): Collection|null
    {
        return $this->query()->where('user_id', $userId)->get();
    }

    /**
     * Delete verify email tokens by user ID
     *
     * @param int $userId
     * @return int
     */
    public function deleteByUserId(int $userId): int
    {
        return $this->query()->where('user_id', $userId)->delete();
    }

    /**
     * Find a verify email token by token string
     *
     * @param string $token
     * @return EmailVerifyToken|null
     */
    public function findByToken(string $token): ?EmailVerifyToken
    {
        return $this->query()->get()->first(fn($item) => $item->isValidToken($token));
    }
}
