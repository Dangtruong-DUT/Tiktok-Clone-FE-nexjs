<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocaleFromHeader
{
    private const SUPPORTED = ['vi', 'en'];
    private const DEFAULT   = 'vi';

    /**
     * Read X-Locale header (sent by Next.js frontend) and set app locale.
     * Falls back to Accept-Language primary tag, then to 'vi'.
     */
    public function handle(Request $request, Closure $next): Response
    {
        App::setLocale($this->resolve($request));

        return $next($request);
    }

    private function resolve(Request $request): string
    {
        // 1. Custom header set by Next.js prepareHeaders
        $xLocale = strtolower(trim((string) $request->header('X-Locale', '')));
        if (in_array($xLocale, self::SUPPORTED, true)) {
            return $xLocale;
        }

        // 2. Accept-Language primary tag (browser default)
        $accept = (string) $request->header('Accept-Language', '');
        if ($accept !== '') {
            $primary = strtolower(explode(',', $accept)[0]);
            $primary = strtolower(explode('-', $primary)[0]);
            if (in_array($primary, self::SUPPORTED, true)) {
                return $primary;
            }
        }

        return self::DEFAULT;
    }
}
