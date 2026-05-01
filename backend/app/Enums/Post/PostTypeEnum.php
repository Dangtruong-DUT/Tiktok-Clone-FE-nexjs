<?php

namespace App\Enums\Post;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum PostTypeEnum: int implements BaseEnumInterface
{
    use BaseEnumTrait;

    case POST = 0;
    case RE_POST = 1;
    case COMMENT = 2;
    case QUOTE_POST = 3;

    /**
     * Get the label of the enum value.
     */
    public function label(): string
    {
        return match ($this) {
            self::POST => 'Post',
            self::RE_POST => 'Re-Post',
            self::COMMENT => 'Comment',
            self::QUOTE_POST => 'Quote Post',
        };
    }

    /**
     * Get the translated label of the enum value.
     */
    public function translate(): string
    {
        return match ($this) {
            self::POST => 'Post',
            self::RE_POST => 'Re-Post',
            self::COMMENT => 'Bình luận',
            self::QUOTE_POST => 'Quote Post',
        };
    }
}
