<?php
namespace App\Traits;

use App\Observers\CreateDefaultUserSettingsObserver;

trait HasCreateDefaultUserSettingObservable
{
    /**
     * Boot the HasCreateDefaultUserSettingObservable trait for a model.
     *
     * @return void
     */
    public static function bootHasCreateDefaultUserSettingObservable(): void
    {
        self::observe(CreateDefaultUserSettingsObserver::class);
    }

}
