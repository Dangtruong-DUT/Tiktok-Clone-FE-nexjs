<?php

namespace App\Exceptions\http;

use Symfony\Component\HttpFoundation\Response;

class ForbiddenException extends BaseException
{
    /**
     * Create a new Forbidden exception instance.
     */
    public function __construct(string $message = 'Forbidden access', array $errors = [])
    {
        parent::__construct(
            message: $message,
            errorCode: 'FORBIDDEN_ERROR',
            errors: $errors,
            httpStatusCode: Response::HTTP_FORBIDDEN
        );
    }
}
