<?php
namespace App\Support;

class JsonPayloadParser
{
    public function parse(mixed $input): ?array
    {
        if (is_array($input)) {
            return $input;
        }

        if (!is_string($input)) {
            return null;
        }

        $decoded = json_decode($input, true);

        return is_array($decoded) ? $decoded : null;
    }
}
