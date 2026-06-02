<?php

namespace App\Exceptions\http;

use Symfony\Component\HttpFoundation\Response;

class ServiceUnavailableException extends BaseException
{
    public function __construct(string $message = 'Service temporarily unavailable.')
    {
        parent::__construct(
            message:        $message,
            errorCode:      'SERVICE_UNAVAILABLE',
            errors:         [],
            httpStatusCode: Response::HTTP_SERVICE_UNAVAILABLE
        );
    }
}
