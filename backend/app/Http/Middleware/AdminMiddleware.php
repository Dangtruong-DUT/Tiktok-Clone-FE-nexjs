<?php

namespace App\Http\Middleware;

use App\Enums\User\RoleTypeEnum;
use App\Http\Response\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     * Checks if the authenticated user has the SUPER_ADMIN role before allowing access to admin routes.
 */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->role !== RoleTypeEnum::SUPER_ADMIN) {
            return ApiResponse::forbidden('You do not have permission to access this resource');
        }

        return $next($request);
    }
}
