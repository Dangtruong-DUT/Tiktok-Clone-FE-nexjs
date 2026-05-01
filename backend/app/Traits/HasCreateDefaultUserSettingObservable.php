<?php

namespace App\Traits;

use App\Observers\CreateDefaultUserSettingsObserver;

trait HasCreateDefaultUserSettingObservable
{
    /**
     * Boot the HasCreateDefaultUserSettingObservable trait for a model.
     */
    public static function bootHasCreateDefaultUserSettingObservable(): void
    {
        self::observe(CreateDefaultUserSettingsObserver::class);
    }
}
