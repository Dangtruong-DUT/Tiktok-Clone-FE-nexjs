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
        };
    }
}
