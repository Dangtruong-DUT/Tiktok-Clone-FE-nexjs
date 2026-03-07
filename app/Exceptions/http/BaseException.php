<?php

namespace App\Exceptions\http;

use Exception;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

abstract class BaseException extends Exception
{
    protected string $errorCode;
    protected int $httpStatusCode;
    protected array $errors;

    public function __construct(
        string $message = 'Internal server error',
        string $errorCode = "BASE_ERROR",
        array $errors = [],
        int $httpStatusCode = Response::HTTP_INTERNAL_SERVER_ERROR
    )
    {
        $this->message = $message;
        $this->errorCode = $errorCode;
        $this->errors = $errors;
        $this->httpStatusCode = $httpStatusCode;
        parent::__construct($this->message, $this->httpStatusCode);
    }

    /**
     * Get the HTTP status code.
     */
    public function getHttpStatusCode(): int
    {
        return $this->httpStatusCode;
    }

    /**
     * Get the validation errors.
     */
    public function getErrors(): array
    {
        return $this->errors;
    }

    /**
    * Report the exception.
    */
    public function report(): void
    {
        // Log if needed
    }


    /**
     * Render the exception into an HTTP response.
     */
    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'code' => $this->getCode(),
            'status' => $this->httpStatusCode,
            'errors' => $this->getErrors(),
        ], $this->httpStatusCode);
    }
}
