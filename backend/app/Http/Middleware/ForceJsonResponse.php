<?php

namespace App\Http\Middleware;

use Closure;

class ForceJsonResponse
{
    public function handle($request, Closure $next)
    {
        if (is_api_request()) {
            $request->headers->set('Accept', 'application/json');
        }
        return $next($request);
    }
}
