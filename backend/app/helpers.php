<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

if (! function_exists('is_api_request')) {

    /**
     * Determine if the current request is an API request.
     */
    function is_api_request(): bool
    {
        return request()->is('api/*') || request()->expectsJson() || request()->wantsJson();
    }

}

if (! function_exists('filter_null_values')) {

    /**
     * Filter out null values from an array.
     */
    function filter_null_values(array $data): array
    {
        return array_filter($data, fn ($value) => ! is_null($value));
    }
}

if (! function_exists('generate_username')) {

    function generate_username(string $name): string
    {
        $base = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name));

        if (empty($base)) {
            $base = 'user';
        }

        $base = substr($base, 0, 15);

        $suffix = strtolower(Str::random(5));

        $username = $base.$suffix;

        $username = substr($username, 0, 20);

        return $username;
    }
}

if (! function_exists('auth_user_id')) {
    /**
     * Get the authenticated user's ID.
     */
    function auth_user_id(): ?int
    {

        if (Auth::guard('api')->user()) {
            return Auth::guard('api')->user()->id;
        }

        return null;
    }
}

if (! function_exists('check_version_conflict')) {
    /**
     * Check if the version conflict
     */
    function check_version_conflict(Model $model, string $timestamp): bool
    {
        $clientVersion = new \DateTime($timestamp);
        $serverVersion = new \DateTime($model->updated_at);

        return $clientVersion < $serverVersion;
    }
}

if (! function_exists('usesSoftDeletesTrait')) {
    /**
     * Determine if model uses soft deletes.
     */
    function usesSoftDeletesTrait(string $modelClass): bool
    {
        return in_array(
            'Illuminate\Database\Eloquent\SoftDeletes',
            class_uses_recursive($modelClass)
        );
    }
}
