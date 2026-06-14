<?php

namespace App\Exceptions\http;

use Symfony\Component\HttpFoundation\Response;

class NotFoundException extends BaseException
{
    /**
     * Create a new Notfound exception instance.
     */
    public function __construct(?string $message = null, array $errors = [])
    {
        parent::__construct(
            message: $message ?? trans('exceptions.not_found'),
            errorCode: 'NOT_FOUND_ERROR',
            errors: $errors,
            httpStatusCode: Response::HTTP_NOT_FOUND
        );
    }
}
