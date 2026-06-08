<?php

namespace App\Services\User;

use App\Models\User;
use App\Models\UserSettings;
use App\Traits\HasAuthUser;

class UserSettingsService
{
    use HasAuthUser;

    /**
     * Create a new service instance.
     */
    public function __construct() {}

    /**
     * Show the user settings.
     *
     * @return UserSettings
     */
    public function show(): UserSettings
    {
        return $this->guard()->user()->settings;
    }

    /**
     * Update the user settings.
     *
     * @param  array{liked_videos_visibility?: string, bookmarked_videos_visibility?: string, followers_visibility?: string, following_visibility?: string}  $data
     * @return UserSettings
     */
    public function update(array $data): UserSettings
    {

        /** @var User $user */
        $user = $this->guard()->user();
        $user->settings()->update([
            'liked_videos_visibility' => $data['liked_videos_visibility'] ?? $user->settings->liked_videos_visibility,
            'bookmarked_videos_visibility' => $data['bookmarked_videos_visibility'] ?? $user->settings->bookmarked_videos_visibility,
            'followers_visibility' => $data['followers_visibility'] ?? $user->settings->followers_visibility,
            'following_visibility' => $data['following_visibility'] ?? $user->settings->following_visibility,
        ]);

        return $user->settings->fresh();
    }
}
