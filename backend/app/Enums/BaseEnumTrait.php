<?php

namespace App\Enums;

trait BaseEnumTrait
{
    /**
     * Get the label of the enum value.
 */
    public static function values(): array
    {
        return array_map(fn ($case) => $case->value, self::cases());
    }

    /**
     * Get the label of the enum value.
 */
    public static function labels(): array
    {
        return array_map(fn ($case) => $case->label(), self::cases());
    }
}
