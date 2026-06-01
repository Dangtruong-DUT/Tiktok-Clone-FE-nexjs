<?php

namespace App\Exceptions\Http;

use App\Exceptions\Http\BaseException;
use Symfony\Component\HttpFoundation\Response;

class TooManyRequestsException extends BaseException
{
    public function __construct(string $message = 'Too many requests. Please try again later.')
    {
        parent::__construct(
            message:        $message,
            errorCode:      'TOO_MANY_REQUESTS',
            errors:         [],
            httpStatusCode: Response::HTTP_TOO_MANY_REQUESTS
        );
    }
}
