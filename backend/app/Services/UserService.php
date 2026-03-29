<?php

namespace App\Services;

use App\Enums\User\RelationshipTypeEnum;
use App\Exceptions\http\BadRequestException;
use App\Exceptions\http\BusinessException;
use App\Models\User;
use App\Repositories\RelationshipRepository;
use App\Repositories\UserRepository;
use App\Traits\HasAuthUser;
use Carbon\CarbonPeriod as CarbonCarbonPeriod;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class UserService
{
    use HasAuthUser;

    public function __construct(
        private readonly RelationshipRepository $relationshipRepo,
        private readonly UserRepository $userRepo
    ) {}


    /**
     * Search users by keyword.
     *
     * @param array $payload
     *              - keyword: the keyword to search for (name, username)
     *              - role: filter by role
     *              - verify_status: filter by verify status
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function search(array $payload): LengthAwarePaginator
    {
        $authUserId = auth_user_id();
        return $this->userRepo->search($payload, $authUserId);
    }

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
        $updatedUser = $this->userRepo->update($authUser->id, [
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

        return $this->getByUsername($updatedUser->username);
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
        $authUserId = auth_user_id();
        return $this->userRepo->getByUsernameWithDetail($username, $authUserId);
    }

    /**
     * Get paginated followers of target user.
     *
     * @param string $userUuid
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getFollowers(string $userUuid, array $filters): LengthAwarePaginator
    {
        $authUserId = auth_user_id();
        $targetUser = $this->userRepo->findByUuidOrFail($userUuid);

        return $this->userRepo->getFollowersByUserId($targetUser->id, $filters, $authUserId);
    }

    /**
     * Get paginated following users of target user.
     *
     * @param string $userUuid
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getFollowing(string $userUuid, array $filters): LengthAwarePaginator
    {
        $authUserId = auth_user_id();
        $targetUser = $this->userRepo->findByUuidOrFail($userUuid);

        return $this->userRepo->getFollowingByUserId($targetUser->id, $filters, $authUserId);
    }

    /**
     * Get paginated mutual friends of target user.
     *
     * @param string $userUuid
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getFriends(string $userUuid, array $filters): LengthAwarePaginator
    {
        $authUserId = auth_user_id();
        $targetUser = $this->userRepo->findByUuidOrFail($userUuid);

        return $this->userRepo->getFriendsByUserId($targetUser->id, $filters, $authUserId);
    }

    /**
     * Get paginated suggested users for authenticated user.
     *
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getSuggestedUsers(array $filters): LengthAwarePaginator
    {
        $authUserId = auth_user_id();

        return $this->userRepo->getSuggestedUsers($filters, $authUserId);
    }

    /**
     * Get indicators of authenticated user in date range.
     *
     * @param array $payload
     * @return array<string, mixed>
     */
    public function getIndicators(array $payload): array
    {
        $authUserId = auth_user_id();
        $fromDate = Carbon::parse($payload['fromDate'])->toDateString();
        $toDate = Carbon::parse($payload['toDate'])->toDateString();

        $rowsByDate = $this->userRepo
            ->getIndicatorsByUserIdAndDateRange($authUserId, $fromDate, $toDate)
            ->keyBy('date');

        $totalLikes = 0;
        $totalGuestsView = 0;
        $totalUsersView = 0;
        $totalComments = 0;
        $indicator = [];

        foreach (CarbonCarbonPeriod::create($fromDate, $toDate) as $date) {
            $dateKey = $date->format('Y-m-d');
            $row = $rowsByDate->get($dateKey);

            $likesCount = (int) ($row->likes_count ?? 0);
            $guestsView = (int) ($row->guests_view ?? 0);
            $usersView = (int) ($row->users_view ?? 0);
            $commentsCount = (int) ($row->comments_count ?? 0);

            $totalLikes += $likesCount;
            $totalGuestsView += $guestsView;
            $totalUsersView += $usersView;
            $totalComments += $commentsCount;

            $indicator[] = [
                'date' => $dateKey,
                'likes_count' => $likesCount,
                'guests_view' => $guestsView,
                'users_view' => $usersView,
                'comments_count' => $commentsCount,
            ];
        }

        return [
            'likes_count' => $totalLikes,
            'guests_view' => $totalGuestsView,
            'users_view' => $totalUsersView,
            'comments_count' => $totalComments,
            'Indicator' => $indicator,
        ];
    }
}
