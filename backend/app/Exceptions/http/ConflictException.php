<?php

namespace App\Exceptions\http;

use Symfony\Component\HttpFoundation\Response;

class ConflictException extends BaseException
{
    /**
     * Create a new conflict exception instance.
     */
    public function __construct(string $message = 'Conflict error occurred', array $errors = [])
    {
        parent::__construct(
            message: $message,
            errorCode: 'CONFLICT_ERROR',
            errors: $errors,
            httpStatusCode: Response::HTTP_CONFLICT
        );
    }
}
