<?php

namespace App\Services;

use App\Exceptions\http\BusinessException;
use App\Repositories\RelationshipRepository;
use App\Repositories\UserRepository;
use App\Traits\HasAuthUser;

class UserService
{
    use HasAuthUser;

    public function __construct(
        private readonly RelationshipRepository $relationshipRepo,
        private readonly UserRepository $userRepo
    ) {}

    /**
     * Change the password of the authenticated user.
     *
     * @param array $data
     * @return bool
     * @throws BusinessException
     */
    public function changePassword(array $data):bool
    {
        $user = $this->guard()->user();
        if (! $user->isCurrentPassword($data['current_password'])) {
            throw new BusinessException('Current password is incorrect',
            [
                'current_password' => ['Current password is incorrect']
            ]);
        }
        $user->password = $data['password'];
        $user->save();
        return true;
    }
}