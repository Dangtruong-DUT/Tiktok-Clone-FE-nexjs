<?php

namespace App\Enums\Notification;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum NotificationTabEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case ALL = 'all';
    case LIKES = 'likes';
    case COMMENTS = 'comments';
    case MENTIONS = 'mentions';
    case FOLLOWERS = 'followers';

    /**
     * Get the label for the notification tab.
     */
    public function label(): string
    {
        return match ($this) {
            self::ALL => 'All',
            self::LIKES => 'Likes',
            self::COMMENTS => 'Comments',
            self::MENTIONS => 'Mentions',
            self::FOLLOWERS => 'Followers',
        };
    }

    /**
     * Get the translated label for the notification tab.
     */
    public function translate(): string
    {
        return match ($this) {
            self::ALL => 'Tất cả',
            self::LIKES => 'Lượt thích',
            self::COMMENTS => 'Bình luận',
            self::MENTIONS => 'Nhắc đến',
            self::FOLLOWERS => 'Người theo dõi',
        };
    }

    /**
     * Map tab to notification type id for query filtering.
     */
    public function notificationTypeValue(): ?int
    {
        return match ($this) {
            self::ALL => null,
            self::LIKES => NotificationTypeEnum::LIKE->value,
            self::COMMENTS => NotificationTypeEnum::COMMENT->value,
            self::MENTIONS => NotificationTypeEnum::MENTION->value,
            self::FOLLOWERS => NotificationTypeEnum::FOLLOW->value,
        };
    }
}
