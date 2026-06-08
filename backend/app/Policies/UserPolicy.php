<?php

namespace App\Policies;

use App\Enums\Settings\PrivacyVisibilityEnum;
use App\Models\User;

class UserPolicy extends BasePolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct() {}

    /**
     * Determine if the given user can view the followers of the target user.
     */
    public function viewFollowers(?User $user, User $targetUser): bool
    {
        return $user?->id === $targetUser->id
        || $targetUser->settings?->followers_visibility === PrivacyVisibilityEnum::PUBLIC;
    }

    /**
     * Determine if the given user can view the followings of the target user.
     */
    public function viewFollowings(?User $user, User $targetUser): bool
    {
        return $user?->id === $targetUser->id
        || $targetUser->settings?->following_visibility === PrivacyVisibilityEnum::PUBLIC;
    }

    public function viewFriends(?User $user, User $targetUser): bool
    {
        return $user?->id === $targetUser->id
        || ($targetUser->settings?->followers_visibility === PrivacyVisibilityEnum::PUBLIC
            && $targetUser->settings?->following_visibility === PrivacyVisibilityEnum::PUBLIC);
    }

    /**
     * Determine if the given user can view the liked videos of the target user.
     */
    public function viewLikedVideos(?User $user, User $targetUser): bool
    {
        return $user?->id === $targetUser->id
        || $targetUser->settings?->liked_videos_visibility === PrivacyVisibilityEnum::PUBLIC;
    }

    /**
     * Determine if the given user can view the bookmarked videos of the target user.
     */
    public function viewBookmarkedVideos(?User $user, User $targetUser): bool
    {
        return $user?->id === $targetUser->id
        || $targetUser->settings?->bookmarked_videos_visibility === PrivacyVisibilityEnum::PUBLIC;
    }
}
