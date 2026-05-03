<?php

namespace App\Traits;

use App\Observers\CreateDefaultUserSettingsObserver;

/**
 * @mixin \Illuminate\Database\Eloquent\Model
 * @method static void observe(string|object $classes)
 */
trait HasCreateDefaultUserSettingObservable
{
    /**
     * Boot the HasCreateDefaultUserSettingObservable trait for a model.
     */
    public static function bootHasCreateDefaultUserSettingObservable(): void
    {
        static::observe(CreateDefaultUserSettingsObserver::class);
    }
}
