<?php

namespace App\Exceptions\http;

use Symfony\Component\HttpFoundation\Response;

class BadRequestException extends BaseException
{
    /**
     * Create a new business exception instance.
     */
    public function __construct(?string $message = null, array $errors = [])
    {
        parent::__construct(
            message: $message ?? trans('exceptions.bad_request'),
            errorCode: 'BAD_REQUEST',
            errors: $errors,
            httpStatusCode: Response::HTTP_BAD_REQUEST
        );
    }
}
