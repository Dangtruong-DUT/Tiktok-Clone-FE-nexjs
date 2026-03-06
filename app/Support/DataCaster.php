<?php
namespace App\Support;

use Exception;

class DataCaster
{
    public static function cast(string $type, mixed $value): mixed
    {
        return match ($type) {
            'integer' => (int) $value,
            'float' => (float) $value,
            'bool' => self::castBool($value),
            default => $value
        };
    }

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

    private static function buildCastKey(string|int $key, string $parent): string
    {
        if (is_numeric($key)) {
            return $parent !== '' ? $parent . '.*' : '*';
        }

        return $parent !== '' ? $parent . '.' . $key : $key;
    }
}
?>
