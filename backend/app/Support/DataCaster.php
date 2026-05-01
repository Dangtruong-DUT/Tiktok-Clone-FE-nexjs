<?php

namespace App\Support;

use Exception;

class DataCaster
{
    /**
     * Cast a value to a specified type.
     *
     * @param  string  $type  The type to cast to (e.g., 'integer', 'float', 'bool').
     * @param  mixed  $value  The value to be cast.
     * @return mixed The casted value.
     *
     * @throws Exception If the type is unsupported or if boolean casting fails.
     */
    public static function cast(string $type, mixed $value): mixed
    {
        return match ($type) {
            'integer' => (int) $value,
            'float' => (float) $value,
            'bool' => self::castBool($value),
            default => $value
        };
    }

    /**
     * Cast a value to a boolean represented as an integer (1 for true, 0 for false).
     *
     * @param  mixed  $value  The value to be cast to boolean.
     * @return int The casted boolean value (1 or 0).
     *
     * @throws Exception If the value cannot be cast to boolean.
     */
    private static function castBool($value): int
    {
        if (in_array($value, ['true', '1', 1, true], true)) {
            return 1;
        }

        if (in_array($value, ['false', '0', 0, false], true)) {
            return 0;
        }

        throw new Exception('Boolean Type Cast Error');
    }

    /**
     * Recursively cast values in a nested array based on provided casts.
     *
     * @param  array  $data  The data to be cast.
     * @param  array  $casts  An associative array where keys are the paths to the values and values are the types to cast to.
     * @param  string  $parentKey  The parent key used for building the cast key (used in recursion).
     * @return array The data with values cast according to the provided casts.
     */
    public static function nestedCast(array $data, array $casts, string $parentKey = ''): array
    {
        $result = [];

        foreach ($data as $key => $value) {

            $castKey = self::buildCastKey($key, $parentKey);

            if (is_array($value)) {
                $result[$key] = self::nestedCast($value, $casts, $castKey);

                continue;
            }

            if (isset($casts[$castKey])) {
                $result[$key] = DataCaster::cast($casts[$castKey], $value);

                continue;
            }

            $result[$key] = $value;
        }

        return $result;
    }

    /**
     * Build a cast key for nested arrays.
     *
     * @param  string|int  $key  The current key being processed.
     * @param  string  $parent  The parent key path built so far.
     * @return string The constructed cast key for the current value.
     */
    private static function buildCastKey(string|int $key, string $parent): string
    {
        if (is_numeric($key)) {
            return $parent !== '' ? $parent.'.*' : '*';
        }

        return $parent !== '' ? $parent.'.'.$key : $key;
    }
}
