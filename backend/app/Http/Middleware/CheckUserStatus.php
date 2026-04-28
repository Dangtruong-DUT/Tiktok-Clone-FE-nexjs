<?php

namespace App\Http\Middleware;

use App\Http\Response\ApiResponse;
use Closure;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;

class CheckUserStatus
{
    /**
     * Check the user's status for the incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  bool  $requireVerify
     * @return mixed
     */
    public function handle($request, Closure $next,bool $requireVerify = false)
    {
        try {
            Log::info('Checking user status for request', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'require_verify' => $requireVerify,
            ]);
            $user = JWTAuth::parseToken()->authenticate();

            if (!$user) {
                return ApiResponse::notFound('User not found');
            }

            if ($user->isBanned()) {
                return ApiResponse::forbidden('Your account has been banned');
            }

            $requireVerify = filter_var($requireVerify, FILTER_VALIDATE_BOOLEAN);
            if ($requireVerify && !$user->isVerified()) {
                return ApiResponse::forbidden('Your account is not verified');
            }
            return $next($request);
        } catch (\Exception $e) {
            return ApiResponse::unauthorized('Unauthorized');
        }
    }
}
