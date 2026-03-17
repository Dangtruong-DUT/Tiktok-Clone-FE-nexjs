<?php
namespace App\Repositories;

use App\Models\RefreshTokens;
use App\Repositories\BaseRepository;
use Illuminate\Support\Collection;

class RefreshTokenRepository extends BaseRepository
{


    /**
     * RefreshTokenRepository constructor.
     */
    public function __construct()
    {
        $modelInstance = app()->make(RefreshTokens::class);
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
}
