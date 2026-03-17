<?php

use App\Models\RefreshTokens;
use App\Repositories\BaseRepository;

class RefreshTokenRepository extends BaseRepository
{


    /**
     * RefreshTokenRepository constructor.
     */
    public function __construct()
    {
        $this->model = new RefreshTokens();
        parent::__construct($this->model);
    }


    /**
     * Find a refresh token by user
     *
     * @param $user
     * @return RefreshTokens|null
     */
    public function findByUser($user): RefreshTokens|null
    {
        return $this->model->where('user_id', $user->id)->first();
    }
}
