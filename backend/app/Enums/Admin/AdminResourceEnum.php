<?php

namespace App\Enums\Admin;

use App\Enums\BaseEnumTrait;
use App\Enums\BaseEnumInterface;

/**
 * Admin resource types that can be audited
 * Used to categorize logged admin actions
 */
enum AdminResourceEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case USER = 'user';
    case POST = 'post';
    case COMMENT = 'comment';
    case MESSAGE = 'message';
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
            self::MESSAGE->value,
            self::APPEAL->value,
            self::RE_POST->value,
            self::QUOTE_POST->value,

        ];
    }


    /**
     * Get the label of the enum value
     */
    public function label(): string
    {
        return match ($this) {
            self::USER => 'User',
            self::POST => 'Post',
            self::COMMENT => 'Comment',
            self::MESSAGE => 'Message',
            self::APPEAL => 'Appeal',
            self::RE_POST => 'Re-Post',
            self::QUOTE_POST => 'Quote Post',
        };
    }


    /**
     * Get the translated label of the enum value
     */
    public function translate(): string
    {
        return match ($this) {
            self::USER => 'Người dùng',
            self::POST => 'Bài viết',
            self::COMMENT => 'Bình luận',
            self::MESSAGE => 'Tin nhắn',
            self::APPEAL => 'Kháng cáo',
            self::RE_POST => 'Đăng lại',
            self::QUOTE_POST => 'Trích dẫn bài viết',
        };
    }
}
