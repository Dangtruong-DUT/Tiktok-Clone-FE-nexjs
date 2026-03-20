<?php

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;
use App\Enums\BaseEnumInterface;

enum UserVerifyStatusEnum:int implements BaseEnumInterface
{
    use BaseEnumTrait;

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
}