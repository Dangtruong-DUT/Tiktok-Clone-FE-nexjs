<?php

namespace App\Exceptions\http;

use Symfony\Component\HttpFoundation\Response;

class JWTException extends BaseException
{
    /**
     * Create a new JWT exception instance.
     */
    public function __construct(?string $message = null, array $errors = [])
    {
        parent::__construct(
            message: $message ?? trans('exceptions.jwt'),
            errorCode: 'JWT_ERROR',
            errors: $errors,
            httpStatusCode: Response::HTTP_UNAUTHORIZED
        );
    }
}
