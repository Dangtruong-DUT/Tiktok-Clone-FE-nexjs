<?php

namespace App\Http\Middleware;

use App\Http\Response\ApiResponse;
use Closure;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class CheckUserStatus
{
    /**
     * Check the user's status for the incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return mixed
 */
    public function handle($request, Closure $next, bool $requireVerify = false)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            if (! $user) {
                return ApiResponse::notFound('User not found');
            }

            if ($user->isBanned()) {
                return ApiResponse::forbidden('Your account has been banned');
            }

            $requireVerify = filter_var($requireVerify, FILTER_VALIDATE_BOOLEAN);
            if ($requireVerify && ! $user->isVerified()) {
                return ApiResponse::forbidden('Your account is not verified');
            }

            return $next($request);
            } catch (JWTException $exception) {
            return ApiResponse::unauthorized('Unauthorized');
        }
    }
}
