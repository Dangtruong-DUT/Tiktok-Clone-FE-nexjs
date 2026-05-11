<?php

namespace App\Enums\Settings;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum PrivacyVisibilityEnum: int implements BaseEnumInterface
{
    use BaseEnumTrait;

    case PUBLIC = 0;
    case PRIVATE = 1;

    /**
     * Get the label of the enum value.
 */
    public function label(): string
    {
        return match ($this) {
            self::PUBLIC => 'Public',
            self::PRIVATE => 'Private',
        };
    }

    /**
     * Get the translated label of the enum value.
 */
    public function translate(): string
    {
        return match ($this) {
            self::PUBLIC => 'Công khai',
            self::PRIVATE => 'Riêng tư',
        };
    }
}
