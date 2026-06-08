<?php

namespace App\Exceptions\http;

use Symfony\Component\HttpFoundation\Response;

class UnauthorizedException extends BaseException
{
    /**
     * Create a new Unauthorized exception instance.
     */
    public function __construct(string $message = 'Unauthorized access', array $errors = [])
    {
        parent::__construct(
            message: $message,
            errorCode: 'UNAUTHORIZED_ERROR',
            errors: $errors,
            httpStatusCode: Response::HTTP_UNAUTHORIZED
        );
    }
}
