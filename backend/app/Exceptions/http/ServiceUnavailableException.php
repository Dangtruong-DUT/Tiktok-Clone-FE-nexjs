<?php

namespace App\Exceptions\http;

use Symfony\Component\HttpFoundation\Response;

class ServiceUnavailableException extends BaseException
{
    public function __construct(?string $message = null)
    {
        parent::__construct(
            message:        $message ?? trans('exceptions.service_unavailable'),
            errorCode:      'SERVICE_UNAVAILABLE',
            errors:         [],
            httpStatusCode: Response::HTTP_SERVICE_UNAVAILABLE
        );
    }
}
