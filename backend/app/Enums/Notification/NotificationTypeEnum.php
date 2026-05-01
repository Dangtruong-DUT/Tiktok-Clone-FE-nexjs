<?php

namespace App\Enums\Notification;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum NotificationTypeEnum: int implements BaseEnumInterface
{
    use BaseEnumTrait;

    case LIKE = 1;
    case COMMENT = 2;
    case FOLLOW = 3;
    case MENTION = 4;
    case HASHTAG = 5;
    case SYSTEM = 6;
    case ADMIN = 7;
    case SECURITY = 8;

    /**
     * Get the label for the notification type.
     */
    public function label(): string
    {
        return match ($this) {
            self::LIKE => 'Like',
            self::COMMENT => 'Comment',
            self::FOLLOW => 'Follow',
            self::MENTION => 'Mention',
            self::HASHTAG => 'Hashtag',
            self::SYSTEM => 'System',
            self::ADMIN => 'Admin',
            self::SECURITY => 'Security',
        };
    }

    /**
     * Get the translated label for the notification type.
     */
    public function translate(): string
    {
        return match ($this) {
            self::LIKE => 'like',
            self::COMMENT => 'comment',
            self::FOLLOW => 'follow',
            self::MENTION => 'mention',
            self::HASHTAG => 'hashtag',
            self::SYSTEM => 'system',
            self::ADMIN => 'admin',
            self::SECURITY => 'Bảo mật',
        };
    }
}
