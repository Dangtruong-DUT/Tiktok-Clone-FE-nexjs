<?php
use Illuminate\Support\Str;

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

    /**
     * Filter out null values from an array.
     *
     * @param array $data
     * @return array
     */
    function filter_null_values(array $data): array
    {
        return array_filter($data, fn($value) => !is_null($value));
    }
}

if (! function_exists('generate_username')) {

    /**
     * Generate a unique username based on the given name.
     *
     * @param string $name
     * @return string
     */
    function generate_username(string $name): string
    {
        $base= Str::slug($name);
        $username = $base.Str::random(30);
        return $username;
    }
}