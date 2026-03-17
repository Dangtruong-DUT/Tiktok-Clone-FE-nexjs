<?php
namespace App\Repositories;

use App\Models\User;

class UserRepository extends BaseRepository
{
    protected $model;

    public function __construct()
    {
        $this->model = new User();
        parent::__construct($this->model);
    }

    /**
     * Check if user exists
     *
     * @param int $id
     * @return bool
     */
    public function isExist($id): bool
    {
        return $this->model->where('id', $id)->exists();
    }
}
?>