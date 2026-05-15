<?php

namespace App\Enums\User;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum UserVerifyStatusEnum: int implements BaseEnumInterface
{
    use BaseEnumTrait;

    case UNVERIFIED = 0;
    case VERIFIED = 1;

    /**
     * Get the label of the enum value.
     */
    public function label(): string
    {
        return match ($this) {
            self::UNVERIFIED => 'Unverified',
            self::VERIFIED => 'Verified',
        };
    }

    /**
     * Get the translated label of the enum value.
     */
    public function translate(): string
    {
        return match ($this) {
            self::UNVERIFIED => 'Chưa xác minh',
            self::VERIFIED => 'Đã xác minh',
        };
    }
}
