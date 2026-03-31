<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
    }

    /**
     * Determine if the given user can view the followers of the target user.
     *  @parUser
     */
    public function viewFollowers(User $user, User $targetUser): bool
    {
        return $user->id === $targetUser->id || $user->settings();
    }
    /**
     * Determine if the given user can view the followings of the target user.
     */
    public function viewFollowings(User $user, User $targetUser): bool
    {
        // Người dùng có thể xem followings của chính mình hoặc nếu họ là bạn bè
        return $user->id === $targetUser->id || $user->isFriendWith($targetUser);
    }
}
