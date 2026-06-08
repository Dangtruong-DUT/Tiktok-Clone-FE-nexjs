<?php

namespace App\Traits;

use App\Observers\HasUsernameObserver;


/**
 * @mixin \Illuminate\Database\Eloquent\Model
 * @method static void observe(string|object $classes)
 */
trait HasUsernameObservable
{
    protected static function bootHasUsernameObservable()
    {
        self::observe(HasUsernameObserver::class);
    }
}
