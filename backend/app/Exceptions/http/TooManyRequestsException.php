<?php

namespace App\Exceptions\http;

use Symfony\Component\HttpFoundation\Response;

class TooManyRequestsException extends BaseException
{
    public function __construct(?string $message = null)
    {
        parent::__construct(
            message:        $message ?? trans('exceptions.too_many_requests'),
            errorCode:      'TOO_MANY_REQUESTS',
            errors:         [],
            httpStatusCode: Response::HTTP_TOO_MANY_REQUESTS
        );
    }
}
