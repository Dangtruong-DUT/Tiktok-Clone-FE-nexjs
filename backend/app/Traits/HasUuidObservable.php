<?php

namespace App\Traits;

use App\Observers\HasUuidObserver;

/**
 * @mixin \Illuminate\Database\Eloquent\Model
 * @method static void observe(string|object $classes)
 */
trait HasUuidObservable
{
    protected static function bootHasUuidObservable()
    {
        static::observe(HasUuidObserver::class);
    }
}
