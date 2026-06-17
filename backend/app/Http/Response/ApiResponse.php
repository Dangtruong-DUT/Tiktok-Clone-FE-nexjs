<?php

namespace App\Http\Response;

use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Symfony\Component\HttpFoundation\Response;

class ApiResponse
{
    /**
     * Return a successful response with the given data, message, and code.
     *
     * @param  mixed  $data  The data to include in the response (default: null).
     * @param  string  $message  The message to include in the response (default: 'Success').
     * @param  int  $code  The HTTP status code for the response (default: 200 OK).
     * @param  array  $meta  Additional meta information to include in the response (default: []).
     * @return \Illuminate\Http\JsonResponse The JSON response containing the data, message, and meta information.
      */
    public static function success(
        $data = null,
        string $message = 'Success',
        int $code = Response::HTTP_OK,
        array $meta = []
    ) {
        $mergedMeta = array_merge(self::extractPagination($data), $meta);
        $data = filter_null_values([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ]);

        if (! empty($mergedMeta)) {
            $data['meta'] = $mergedMeta;
        }

        return response()->json($data, $code);
    }

    /**
     * Return an error response with the given message, code, and errors.
     *
     * @param  string  $message  The error message to include in the response (default: 'Error').
     * @param  int  $code  The HTTP status code for the response (default: 400 Bad Request).
     * @param  mixed  $errors  Additional error details to include in the response (default: null
     *                         can be an array or string).
     * @return \Illuminate\Http\JsonResponse The JSON response containing the error message and details.
      */
    public static function error(string $message = 'Error', int $code = Response::HTTP_BAD_REQUEST, $errors = null)
    {
        $data = filter_null_values([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ]);

        return response()->json($data, $code);
    }

    /**
     * Return a 204 No Content response for successful DELETE operations.
     *
     * @return \Illuminate\Http\Response
     */
    public static function noContent(): \Illuminate\Http\Response
    {
        return response()->noContent();
    }

    /**
     * Return a created response with the given data and message.
     *
     * @param  mixed  $data  The data to include in the response (default: null).
     * @param  string  $message  The message to include in the response (default: 'Created successfully').
     * @param  array  $meta  Additional meta information to include in the response (default: []).
     * @return \Illuminate\Http\JsonResponse The JSON response containing the data, message, and meta information.
     */
    public static function created($data = null, string $message = 'Created successfully', array $meta = [])
    {
        return self::success($data, $message, Response::HTTP_CREATED, $meta);
    }

    /**
     * Return a not found error response with the given message.
     *
     * @param  string  $message  The message to include in the response (default: 'Resource not found').
     * @return \Illuminate\Http\JsonResponse The JSON response containing the error message.
 */
    public static function notFound(string $message = 'Resource not found')
    {
        return self::error($message, Response::HTTP_NOT_FOUND);
    }

    /**
     * Return a forbidden error response with the given message.
     *
     * @param  string  $message  The message to include in the response (default: 'Forbidden').
     * @return \Illuminate\Http\JsonResponse The JSON response containing the error message.
 */
    public static function forbidden(string $message = 'Forbidden')
    {
        return self::error($message, Response::HTTP_FORBIDDEN);
    }

    /**
     * Return an unauthorized error response with the given message.
     *
     * @param  string  $message  The message to include in the response (default: 'Unauthorized').
     * @return \Illuminate\Http\JsonResponse The JSON response containing the error message.
 */
    public static function unauthorized(string $message = 'Unauthorized')
    {
        return self::error($message, Response::HTTP_UNAUTHORIZED);
    }

    /**
     * Return a validation error response with the given errors and message.
     *
     * @param  array|string  $errors  The validation errors to include in the response.
     * @param  string  $message  The message to include in the response (default: 'Validation failed').
     * @return \Illuminate\Http\JsonResponse The JSON response containing the validation errors and message.
 */
    public static function validationError($errors, string $message = 'Validation failed')
    {
        return self::error($message, Response::HTTP_UNPROCESSABLE_ENTITY, $errors);
    }

    /**
     * Extract pagination information from the given data if it is a paginated resource.
     *
     * @param  mixed  $data  The data from which to extract pagination information (can be an instance of AnonymousResourceCollection, LengthAwarePaginator, Paginator, or CursorPaginator).
     * @return array An array containing the extracted pagination information, or an empty array if no pagination information is found.
 */
    private static function extractPagination(&$data): array
    {
        $meta = [];

        if ($data instanceof AnonymousResourceCollection) {
            $resource = $data->resource;
            $wrappedResource = $data;
            $data = $resource;
            $meta = self::extractPagination($data);
            $wrappedResource->collection = collect($data);
            $data = $wrappedResource;

            return $meta;
        }

        if ($data instanceof LengthAwarePaginator) {
            $meta = [
                'type' => 'offset',
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
                'next_page_url' => $data->nextPageUrl(),
                'prev_page_url' => $data->previousPageUrl(),
            ];
            $data = $data->items();

            return $meta;
        }

        if ($data instanceof Paginator) {
            $meta = [
                'type' => 'simple',
                'current_page' => $data->currentPage(),
                'per_page' => $data->perPage(),
                'next_page_url' => $data->nextPageUrl(),
                'prev_page_url' => $data->previousPageUrl(),
            ];
            $data = $data->items();

            return $meta;
        }

        if ($data instanceof CursorPaginator) {
            $meta = [
                'type' => 'cursor',
                'per_page' => $data->perPage(),
                'next_cursor' => optional($data->nextCursor())->encode(),
                'prev_cursor' => optional($data->previousCursor())->encode(),
            ];
            $data = $data->items();

            return $meta;
        }

        return $meta;
    }
}
