<?php

namespace App\Exceptions\http;

use Symfony\Component\HttpFoundation\Response;

class ConflictException extends BaseException
{
    /**
     * Create a new conflict exception instance.
     */
    public function __construct(?string $message = null, array $errors = [])
    {
        parent::__construct(
            message: $message ?? trans('exceptions.conflict'),
            errorCode: 'CONFLICT_ERROR',
            errors: $errors,
            httpStatusCode: Response::HTTP_CONFLICT
        );
    }
}
