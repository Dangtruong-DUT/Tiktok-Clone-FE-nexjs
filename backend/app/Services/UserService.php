<?php

namespace App\Services;

use App\Enums\User\RelationshipTypeEnum;
use App\Exceptions\http\BadRequestException;
use App\Exceptions\http\BusinessException;
use App\Models\User;
use App\Repositories\RelationshipRepository;
use App\Repositories\UserRepository;
use App\Traits\HasAuthUser;
use Illuminate\Support\Facades\DB;

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
     *              - user_uuid: the uuid of the user to follow
     * @return bool
     * @throws BadRequestException
     * @throws BusinessException
     */
    public function follow(array $data): bool
    {
        $targetUserUuid = $data['user_uuid'];
        $targetUser = $this->userRepo->findByUuid($targetUserUuid);
        if (!$targetUser) {
            throw new BusinessException('The user you are trying to follow does not exist');
        }

        $user = $this->guard()->user();
        if ($user->uuid === $targetUserUuid) {
            throw new BadRequestException('You cannot follow yourself');
        }

        if ($this->relationshipRepo->isFollowing($user->id, $targetUser->id)) {
            return true;
        }
        DB::transaction(function () use ($user, $targetUser) {
            $this->relationshipRepo->create([
                'user_id' => $user->id,
                'target_user_id' => $targetUser->id,
                'type' => RelationshipTypeEnum::FOLLOW->value
            ]);
            $user->increment('following_count');
            $targetUser->increment('followers_count');
        });

        return true;
    }

    /**
     * Unfollow someone
     *
     * @param array $data
     *            - user_uuid: the uuid of the user to unfollow
     * @return bool
     */
    public function unfollow(array $data): bool
    {
        $targetUserUuid = $data['user_uuid'];
        $targetUser = $this->userRepo->findByUuid($targetUserUuid);
        $user = $this->guard()->user();
        if (!$this->relationshipRepo->isFollowing($user->id, $targetUser->id)) {
            return true;
        }
        DB::transaction(function () use ($user, $targetUser) {
            $this->relationshipRepo->deleteRelationship($user->id, $targetUser->id, RelationshipTypeEnum::FOLLOW);
            $user->decrement('following_count');
            $targetUser->decrement('followers_count');
        });
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

    /**
     * Get the authenticated user.
     *
     * @return User
     */
    public function getAuthenticatedUser(): User
    {
        $id=  $this->guard()->id();
        return $this->userRepo->getByIdWithDetail($id, $id);
    }
}
