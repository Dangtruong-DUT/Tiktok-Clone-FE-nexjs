<?php

if (! function_exists('is_api_request')) {

    /**
     * Determine if the current request is an API request.
     *
     * @return bool
     */
    function is_api_request(): bool
    {
        return request()->is('api/*') || request()->expectsJson()||request()->wantsJson();
    }

}


if (! function_exists('filter_null_values')) {
    function filter_null_values(array $data): array
    {
        return array_filter($data, fn($value) => !is_null($value));
    }
}
