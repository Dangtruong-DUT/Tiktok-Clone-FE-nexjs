<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontReport = [];

    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function render($request, Throwable $e): mixed
    {
        if ($request->expectsJson() && $e instanceof GeminiQuotaExceededException) {
            return new JsonResponse([
                'success' => false,
                'message' => 'AI quota exceeded. Please wait a few minutes and try again.',
                'code'    => 'AI_QUOTA_EXCEEDED',
            ], 429);
        }

        return parent::render($request, $e);
    }
}
