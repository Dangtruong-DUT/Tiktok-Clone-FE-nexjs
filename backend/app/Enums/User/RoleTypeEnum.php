<?php

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;
use App\Enums\BaseEnumInterface;

enum RoleType:int implements BaseEnumInterface
{
    use BaseEnumTrait;

    case USER = 0;
    case SUPER_ADMIN = 1;


    /**
     * Get the label of the enum value.
     */
    public function label(): string
    {
        return match($this) {
            self::USER => 'User',
            self::SUPER_ADMIN => 'Super Admin',
        };
    }


    /**
     * Get the translated label of the enum value.
     */
    public function translate(): string
    {
        return match($this) {
            self::USER => "Người dùng",
            self::SUPER_ADMIN => "Quản trị viên cấp cao",
        };
    }
}