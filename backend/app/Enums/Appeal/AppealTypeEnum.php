<?php

namespace App\Enums\Appeal;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

/**
 * AppealTypeEnum - Types of appeals users can file
 */
enum AppealTypeEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case USER_BAN = 'user_ban';
    case POST_HIDDEN = 'post_hidden';
    case POST_DELETED = 'post_deleted';
    case COMMENT_DELETED = 'comment_deleted';
    case COMMENT_HIDDEN = 'comment_hidden';

    /**
     * Get a human-readable label for the appeal type
     *
     * @return string
     */
    public function label(): string
    {
        return match($this) {
            self::USER_BAN => 'User Ban Appeal',
            self::POST_HIDDEN => 'Post Hidden Appeal',
            self::POST_DELETED => 'Post Deleted Appeal',
            self::COMMENT_DELETED => 'Comment Deleted Appeal',
            self::COMMENT_HIDDEN => 'Comment Hidden Appeal',
        };
    }

    /**
     * Get a translated string for the appeal type (e.g. for notifications)
     *
     * @return string
     */
    public function translate(): string
    {
        return match($this) {
            self::USER_BAN => 'Kháng cáo khóa tài khoản',
            self::POST_HIDDEN => 'Kháng cáo ẩn bài viết',
            self::POST_DELETED => 'Kháng cáo xóa bài viết',
            self::COMMENT_DELETED => 'Kháng cáo xóa bình luận',
            self::COMMENT_HIDDEN => 'Kháng cáo ẩn bình luận',
        };
    }

    public static function fromAdminAction(AdminActionEnum $action): ?self
    {
        return match($action) {
            AdminActionEnum::BAN => self::USER_BAN,
            AdminActionEnum::HIDE_POST => self::POST_HIDDEN,
            AdminActionEnum::DELETE_POST => self::POST_DELETED,
            AdminActionEnum::HIDE_COMMENT => self::COMMENT_HIDDEN,
            AdminActionEnum::DELETE_COMMENT => self::COMMENT_DELETED,
            default => null,
        };
    }

}
