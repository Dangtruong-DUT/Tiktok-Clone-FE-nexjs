<?php

namespace App\Enums\Auth;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum TokenTypeEnum: int implements BaseEnumInterface
{
    use BaseEnumTrait;
    case ACCESS = 0;
    case REFRESH = 1;

    /**
     * Get the label of the enum value.
     */
    public function label(): string
    {
        return match ($this) {
            self::ACCESS => 'Access Token',
            self::REFRESH => 'Refresh Token',
        };
    }

    /**
     * Get the translated label of the enum value.
     */
    public function translate(): string
    {
        return match ($this) {
            self::ACCESS => 'Access Token',
            self::REFRESH => 'Refresh Token',
        };
    }
}
