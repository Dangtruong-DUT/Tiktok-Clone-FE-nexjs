<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;

trait HasAuthUser
{
    /**
     * Get the guard to be used during authentication.
     *
     * @return \Tymon\JWTAuth\JWTGuard
     */
    protected function guard()
    {
        // @phpstan-ignore return.type
        return Auth::guard('api');
    }
}
