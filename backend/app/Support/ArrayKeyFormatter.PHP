<?php
namespace App\Support;

class ArrayKeyFormatter
{
    public static function toSnakeCase(array $array): array
    {
        $result = [];

        foreach ($array as $key => $value) {
            $snakeKey = \Illuminate\Support\Str::snake($key);

            if (is_array($value)) {
                $value = self::toSnakeCase($value);
            }

            $result[$snakeKey] = $value;
        }

        return $result;
    }
}

?>
