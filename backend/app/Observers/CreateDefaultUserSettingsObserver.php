<?php

namespace App\Observers;

use App\Enums\Settings\PrivacyVisibilityEnum;
use App\Models\User;

class CreateDefaultUserSettingsObserver
{
    /**
     * Handle the Model "created" event.
     *
     * @param  \App\Models\User  $model
     * @return void
     */
    public function created(User $model): void
    {
        if (! $model->settings) {
            $model->settings()->firstOrCreate([
                'liked_videos_visibility' => PrivacyVisibilityEnum::PUBLIC->value,
                'bookmarked_videos_visibility' => PrivacyVisibilityEnum::PUBLIC->value,
                'followers_visibility' => PrivacyVisibilityEnum::PUBLIC->value,
                'following_visibility' => PrivacyVisibilityEnum::PUBLIC->value,
            ]);
        }
    }
}
