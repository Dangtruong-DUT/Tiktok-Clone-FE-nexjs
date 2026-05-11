<?php

namespace App\Enums\Ai;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum AiModerationLabelEnum: int implements BaseEnumInterface
{
    use BaseEnumTrait;

    case NORMAL = 0;
    case TOXIC = 1;

    /**
     * Get the label of the enum value.
 */
    public function label(): string
    {
        return match ($this) {
            self::NORMAL => 'Normal',
            self::TOXIC => 'Toxic',
        };
    }

    /**
     * Get the translated label of the enum value.
 */
    public function translate(): string
    {
        return match ($this) {
            self::NORMAL => 'Bình thường',
            self::TOXIC => 'Độc hại',
        };
    }
}
