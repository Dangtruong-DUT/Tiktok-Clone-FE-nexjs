<?php

use App\Exceptions\http\BaseException;
use App\Http\Response\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        channels: __DIR__.'/../routes/channels.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'check_user_status' => \App\Http\Middleware\CheckUserStatus::class,
        ]);

        $middleware->append([
            \App\Http\Middleware\ForceJsonResponse::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {

        $exceptions->render(function (Throwable $e, $request) {
                Log::error('An error occurred', [
                    'message' => $e->getMessage(),
                    'exception' => get_class($e),
                ]);
            if (! is_api_request()) {
                return null;
            }

            return match (true) {

                $e instanceof AccessDeniedHttpException => ApiResponse::error(
                    $e->getMessage() ?: 'Unauthorized',
                    Response::HTTP_FORBIDDEN
                ),

                $e instanceof BaseException => ApiResponse::error(
                    $e->getMessage(),
                    $e->getHttpStatusCode(),
                    $e->getErrors()
                ),

                $e instanceof ModelNotFoundException => ApiResponse::error(
                    'Resource not found',
                    Response::HTTP_NOT_FOUND
                ),

                $e instanceof NotFoundHttpException => ApiResponse::error(
                    'Route not found',
                    Response::HTTP_NOT_FOUND
                ),

                $e instanceof AuthenticationException => ApiResponse::error(
                    'Unauthenticated',
                    Response::HTTP_UNAUTHORIZED
                ),

                $e instanceof AuthorizationException => ApiResponse::error(
                    $e->getMessage() ?: 'Forbidden',
                    Response::HTTP_FORBIDDEN
                ),

                $e instanceof ValidationException => ApiResponse::error(
                    'Validation failed',
                    Response::HTTP_UNPROCESSABLE_ENTITY,
                    $e->errors()
                ),

                $e instanceof MethodNotAllowedHttpException => ApiResponse::error(
                    'Method not allowed',
                    Response::HTTP_METHOD_NOT_ALLOWED
                ),

                default => config('app.debug')
                    ? ApiResponse::error(
                        $e->getMessage(),
                        Response::HTTP_INTERNAL_SERVER_ERROR,
                        [
                            'file' => $e->getFile(),
                            'line' => $e->getLine(),
                            'trace' => $e->getTrace(),
                        ]
                    )
                    : ApiResponse::error(
                        'Internal Server Error',
                        Response::HTTP_INTERNAL_SERVER_ERROR
                    ),
            };
        });

})->create();
