<?php

namespace App\Traits;

use App\Observers\HasUsernameObserver;

trait HasUsernameObservable
{
    protected static function bootHasUsernameObservable()
    {
        self::observe(HasUsernameObserver::class);
    }
}
