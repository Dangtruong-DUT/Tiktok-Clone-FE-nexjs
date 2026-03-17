<?php

namespace App\Enums;

enum UserVerifyStatus:int
{
    case UNVERIFIED = 0;
    case VERIFIED = 1;
    case BANNED = 2;


    /**
     * Get the label of the enum value.
     */
    public function label(): string
    {
        return match($this) {
            self::UNVERIFIED => 'Unverified',
            self::VERIFIED => 'Verified',
            self::BANNED => 'Banned',
        };
    }


    /**
     * Get the translated label of the enum value.
     */
    public function translate(): string
    {
        return match($this) {
            self::UNVERIFIED => "Chưa xác minh",
            self::VERIFIED => "Đã xác minh",
            self::BANNED => "Bị cấm",
        };
    }

    public static function values(): array
    {
        return array_map(fn($case) => $case->value, self::cases());
    }

    public static function labels(): array
    {
        return array_map(fn($case) => $case->label(), self::cases());
    }

}
