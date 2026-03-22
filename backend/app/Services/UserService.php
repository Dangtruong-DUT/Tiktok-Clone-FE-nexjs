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
     * @param array $payload
     * @return bool
     * @throws BusinessException
     */
    public function changePassword(array $payload): bool
    {
        $authUser = $this->guard()->user();
        if (! $authUser->isCurrentPassword($payload['current_password'])) {
            throw new BusinessException('Current password is incorrect',
            [
                'current_password' => ['Current password is incorrect']
            ]);
        }
        $authUser->password = $payload['password'];
        $authUser->save();
        return true;
    }

    /**
     * Follow someone
     *
     * @param array $payload
     *              - user_uuid: the uuid of the user to follow
     * @return bool
     * @throws BadRequestException
     * @throws BusinessException
     */
    public function follow(array $payload): bool
    {
        $targetUserUuid = $payload['user_uuid'];
        $targetUser = $this->userRepo->findByUuid($targetUserUuid);
        if (!$targetUser) {
            throw new BusinessException('The user you are trying to follow does not exist');
        }

        $authUser = $this->guard()->user();
        if ($authUser->uuid === $targetUserUuid) {
            throw new BadRequestException('You cannot follow yourself');
        }

        if ($this->relationshipRepo->isFollowing($authUser->id, $targetUser->id)) {
            return true;
        }
        DB::transaction(function () use ($authUser, $targetUser) {
            $this->relationshipRepo->create([
                'user_id' => $authUser->id,
                'target_user_id' => $targetUser->id,
                'type' => RelationshipTypeEnum::FOLLOW->value
            ]);
            $authUser->increment('following_count');
            $targetUser->increment('followers_count');
        });

        return true;
    }

    /**
     * Unfollow someone
     *
     * @param array $payload
     *            - user_uuid: the uuid of the user to unfollow
     * @return bool
     */
    public function unfollow(array $payload): bool
    {
        $targetUserUuid = $payload['user_uuid'];
        $targetUser = $this->userRepo->findByUuid($targetUserUuid);
        $authUser = $this->guard()->user();
        if (!$this->relationshipRepo->isFollowing($authUser->id, $targetUser->id)) {
            return true;
        }
        DB::transaction(function () use ($authUser, $targetUser) {
            $this->relationshipRepo->deleteRelationship($authUser->id, $targetUser->id, RelationshipTypeEnum::FOLLOW);
            $authUser->decrement('following_count');
            $targetUser->decrement('followers_count');
        });
        return true;
    }

    /**
     * Update the profile of the authenticated user.
     *
     * @param array $payload
     * @return User
     */
    public function update(array $payload): User
    {
        $authUser = $this->guard()->user();
        $allowedFields = [
            'name',
            'date_of_birth',
            'bio',
            'location',
            'website',
            'username',
            'avatar_file_id'
        ];
        $updateData = array_intersect_key($payload, array_flip($allowedFields));

        if (empty($updateData)) {
            throw new BusinessException('No valid fields to update');
        }
        $this->userRepo->update($authUser->id, [
            'name' => $updateData['name'] ?? $authUser->name,
            'date_of_birth' => $updateData['date_of_birth'] ?? $authUser->date_of_birth,
            'bio' => $updateData['bio'] ?? $authUser->bio,
            'location' => $updateData['location'] ?? $authUser->location,
            'website' => $updateData['website'] ?? $authUser->website,
            'username' => $updateData['username'] ?? $authUser->username,
            'avatar_file_id' => array_key_exists('avatar_file_id', $updateData)
                ? $updateData['avatar_file_id']
                : $authUser->avatar_file_id,
        ]);

        return $this->getByUsername($authUser->username);
    }

    /**
     * Get the authenticated user.
     *
     * @return User
     */
    public function me(): User
    {
        return $this->getByUsername($this->guard()->user()->username);
    }

    /**
     * Get user profile by username.
     *
     * @param string $username
     * @return User
     */
    public function getByUsername(string $username): User
    {
        $authUserId = $this->guard()->id();
        return $this->userRepo->getByUsernameWithDetail($username, $authUserId);
    }
}
