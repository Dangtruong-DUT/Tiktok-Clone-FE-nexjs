<?php

namespace App\Exceptions;

class GeminiQuotaExceededException extends \RuntimeException
{
    public function __construct(string $message = 'AI quota exceeded. Please try again later.')
    {
        parent::__construct($message);
    }
}
