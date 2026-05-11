<?php

namespace App\Enums\Common;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;
use App\Enums\Post\PostTypeEnum;

/**
 * Business resource types used across the system.
 * This enum represents meaningful domain resources.
 */
enum ResourceTypeEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case USER = 'user';
    case POST = 'post';
    case COMMENT = 'comment';
    case APPEAL = 'appeal';
    case RE_POST = 're-post';
    case QUOTE_POST = 'quote-post';

    /**
     * Get resource values accepted for appeal creation.
     *
     * @return list<string>
 */
    public static function appealValues(): array
    {
        return [
            self::USER->value,
            self::POST->value,
            self::COMMENT->value,
            self::APPEAL->value,
            self::RE_POST->value,
            self::QUOTE_POST->value,
        ];
    }

    /**
     * Get the label of the enum value.
 */
    public function label(): string
    {
        return match ($this) {
            self::USER => 'User',
            self::POST => 'Post',
            self::COMMENT => 'Comment',
            self::APPEAL => 'Appeal',
            self::RE_POST => 'Re-Post',
            self::QUOTE_POST => 'Quote Post',
        };
    }

    /**
     * Get the translated label of the enum value.
 */
    public function translate(): string
    {
        return match ($this) {
            self::USER => 'Người dùng',
            self::POST => 'Bài viết',
            self::COMMENT => 'Bình luận',
            self::APPEAL => 'Kháng cáo',
            self::RE_POST => 'Đăng lại',
            self::QUOTE_POST => 'Trích dẫn bài viết',
        };
    }

    /**
     * Try to create ResourceTypeEnum from PostTypeEnum.
 */
    public static function tryFromPostType(PostTypeEnum $postType): ?self
    {
        return match ($postType) {
            PostTypeEnum::POST => self::POST,
            PostTypeEnum::RE_POST => self::RE_POST,
            PostTypeEnum::QUOTE_POST => self::QUOTE_POST,
            PostTypeEnum::COMMENT => self::COMMENT,
            default => null,
        };
    }
}
