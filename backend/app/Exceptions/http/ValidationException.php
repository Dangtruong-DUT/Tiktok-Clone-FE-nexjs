<?php

namespace App\Exceptions\http;

use Symfony\Component\HttpFoundation\Response;

class ValidationException extends BaseException
{
    /**
     * Create a new validation exception instance.
     */
    public function __construct(string $message = 'Validation failed', protected array $errors = [])
    {
        parent::__construct(
            message: $message,
            errorCode: 'VALIDATION_ERROR',
            errors: $errors,
            httpStatusCode: Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

}
