<?php

namespace App\Enums\User;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum RelationshipTypeEnum: int implements BaseEnumInterface
{
    use BaseEnumTrait;
    case FOLLOW = 0;
    case FRIEND = 1;

    /**
     * Get the label of the enum value.
 */
    public function label(): string
    {
        return match ($this) {
            self::FOLLOW => 'Follow',
            self::FRIEND => 'Friend',
        };
    }

    /**
     * Get the translated label of the enum value.
 */
    public function translate(): string
    {
        return match ($this) {
            self::FOLLOW => 'Theo dõi',
            self::FRIEND => 'Bạn bè',
        };
    }
}
