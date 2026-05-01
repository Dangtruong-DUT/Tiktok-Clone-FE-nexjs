<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserSettings;
use App\Traits\HasAuthUser;

class UserSettingsService
{
    use HasAuthUser;

    /**
     * UserSettingsService constructor.
     */
    public function __construct() {}

    /**
     * Show the user settings.
     */
    public function show(): UserSettings
    {
        $userSettings = $this->guard()->user()->settings;

        return $userSettings;
    }

    /**
     * Update the user settings.
     *
     * @param  array  $data
     *                       - liked_videos_visibility
     *                       - bookmarked_videos_visibility
     *                       - followers_visibility
     *                       - following_visibility
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
