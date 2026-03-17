<?php

namespace App\Traits;

use App\Observers\HasUuidObserver;

trait HasUuidObservable
{
    protected static function bootHasUuidObservable()
    {
        self::observe(HasUuidObserver::class);
    }
}