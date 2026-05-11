<?php

namespace App\Console\Commands;

use App\Enums\Settings\PrivacyVisibilityEnum;
use App\Models\User;
use Illuminate\Console\Command;

class CreateMissingUserSettingsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
 */
    protected $signature = 'app:create-missing-user-settings';

    /**
     * The console command description.
     *
     * @var string
 */
    protected $description = 'Create missing user settings for users who do not have them.';

    public function handle()
    {
        $this->info('Creating missing user settings...');
        User::doesntHave('settings')->chunk(100, function ($users) {
            foreach ($users as $user) {
                $user->settings()->create([
                    'liked_videos_visibility' => PrivacyVisibilityEnum::PUBLIC->value,
                    'bookmarked_videos_visibility' => PrivacyVisibilityEnum::PUBLIC->value,
                    'followers_visibility' => PrivacyVisibilityEnum::PUBLIC->value,
                    'following_visibility' => PrivacyVisibilityEnum::PUBLIC->value,
                ]);
            }
        });

        $this->info('User settings created successfully!');
    }
}
