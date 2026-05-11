<?php

namespace App\Http\Middleware;

use Closure;

class ForceJsonResponse
{
    /**
     * Force the response to be JSON for API requests.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return mixed
 */
    public function handle($request, Closure $next)
    {
        if (is_api_request()) {
            $request->headers->set('Accept', 'application/json');
        }

        return $next($request);
    }
}
