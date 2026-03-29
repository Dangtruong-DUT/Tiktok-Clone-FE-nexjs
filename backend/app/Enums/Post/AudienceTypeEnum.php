<?php

namespace App\Enums\Post;

use App\Enums\BaseEnumTrait;
use App\Enums\BaseEnumInterface;

enum AudienceTypeEnum:int implements BaseEnumInterface
{
    use BaseEnumTrait;

    case PUBLIC = 0;
    case PRIVATE = 1;
    case FRIENDS = 2;
    case FOLLOWING = 3;


    /**
     * Get the label of the enum value.
     */
    public function label(): string
    {
        return match($this) {
            self::PUBLIC => 'Public',
            self::PRIVATE => 'Private',
            self::FRIENDS => 'Friends',
        };
    }


    /**
     * Get the translated label of the enum value.
     */
    public function translate(): string
    {
        return match($this) {
            self::PUBLIC => "Công khai",
            self::PRIVATE => "Riêng tư",
            self::FRIENDS => "Bạn bè",
        };
    }
}
