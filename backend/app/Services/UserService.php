<?php

namespace App\Services;

use App\Enums\User\RelationshipTypeEnum;
use App\Exceptions\http\BadRequestException;
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

    /**
     * Follow someone
     *
     * @param array $data
     * @return bool
     * @throws BadRequestException
     * @throws BusinessException
     */
    public function follow(array $data): bool
    {
        $targetUser = $data['user_id'];
        $user = $this->guard()->user();
        if ($user->id === $targetUser) {
            throw new BadRequestException('You cannot follow yourself');
        }

        if ($this->relationshipRepo->isFollowing($user->id, $targetUser)) {
            throw new BadRequestException('You are already following this user');
        }

        $this->relationshipRepo->create([
            'user_id' => $user->id,
            'target_user_id' => $targetUser,
            'type' => RelationshipTypeEnum::FOLLOW->value
        ]);
        return true;
    }

    /**
     * Unfollow someone
     *
     * @param array $data
     * @return bool
     */
    public function unfollow(array $data): bool
    {
        $targetUser = $data['user_id'];
        $user = $this->guard()->user();
        if (!$this->relationshipRepo->isFollowing($user->id, $targetUser)) {
            throw new BadRequestException('You are not following this user');
        }
        $this->relationshipRepo->deleteRelationship($user->id, $targetUser, RelationshipTypeEnum::FOLLOW);
        return true;
    }

    /**
     * Update the profile of the authenticated user.
     *
     * @param array $data
     * @return bool
     */
    public function updateProfile(array $data): bool
    {
        $user = $this->guard()->user();
        $allowedFields = [
            'name',
            'date_of_birth',
            'bio',
            'location',
            'website',
            'username',
            'avatar_file_id'
        ];
        $updateData = array_intersect_key($data, array_flip($allowedFields));

        if (!empty($updateData)) {
            $this->userRepo->update($user->id, $updateData);
        }

        return true;
    }
}
