<?php

namespace App\Exceptions\http;

use Symfony\Component\HttpFoundation\Response;

class BusinessException extends BaseException
{
    /**
     * Create a new business exception instance.
     */
    public function __construct(string $message = 'Business error occurred', array $errors = [])
    {
        parent::__construct(
            message: $message,
            errorCode: 'BUSINESS_ERROR',
            errors: $errors,
            httpStatusCode: Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }
}
