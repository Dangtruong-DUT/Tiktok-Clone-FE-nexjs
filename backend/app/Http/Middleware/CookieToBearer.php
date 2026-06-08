<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CookieToBearer
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->hasHeader('Authorization') && $request->hasCookie('access_token')) {
            $request->headers->set('Authorization', 'Bearer ' . $request->cookie('access_token'));
        }

        return $next($request);
    }
}
