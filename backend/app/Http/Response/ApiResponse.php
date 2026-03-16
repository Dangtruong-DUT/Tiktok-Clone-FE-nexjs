<?php

namespace App\Http\Response;

use Symfony\Component\HttpFoundation\Response;

class ApiResponse
{
    public static function success($data = null, string $message = 'Success', int $code = Response::HTTP_OK)
    {
        $data = filter_null_values([
            'success' => true,
            'data' => $data,
            'message' => $message,
        ]);

        return response()->json($data, $code);
    }

    public static function error(string $message = 'Error', int $code = Response::HTTP_BAD_REQUEST, $errors = null)
    {
        $data =filter_null_values([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ]);

        return response()->json($data, $code);
    }

    public static function created($data = null, string $message = 'Created successfully')
    {
        return self::success($data, $message, Response::HTTP_CREATED);
    }

    public static function notFound(string $message = 'Resource not found')
    {
        return self::error($message, Response::HTTP_NOT_FOUND);
    }

    public static function forbidden(string $message = 'Forbidden')
    {
        return self::error($message, Response::HTTP_FORBIDDEN);
    }

    public static function unauthorized(string $message = 'Unauthorized')
    {
        return self::error($message, Response::HTTP_UNAUTHORIZED);
    }

    public static function validationError($errors, string $message = 'Validation failed')
    {
        return self::error($message, Response::HTTP_UNPROCESSABLE_ENTITY, $errors);
    }
}
