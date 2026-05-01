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
    case USER_UNBAN = 'user_unban';
    case POST_DELETED = 'post_deleted';
    case COMMENT_DELETED = 'comment_deleted';

    /**
     * Get a human-readable label for the appeal type
     *
     * @return string
     */
    public function label(): string
    {
        return match($this) {
            self::USER_BAN => 'User Ban Appeal',
            self::USER_UNBAN => 'User Unban Appeal',
            self::POST_DELETED => 'Post Deleted Appeal',
            self::COMMENT_DELETED => 'Comment Deleted Appeal',
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
            self::USER_UNBAN => 'Kháng cáo mở khóa tài khoản',
            self::POST_DELETED => 'Kháng cáo xóa bài viết',
            self::COMMENT_DELETED => 'Kháng cáo xóa bình luận',
        };
    }

    public static function fromAdminAction(AdminActionEnum $action): ?self
    {
        return match($action) {
            AdminActionEnum::BAN => self::USER_BAN,
            AdminActionEnum::UNBAN => self::USER_UNBAN,
            AdminActionEnum::DELETE_POST => self::POST_DELETED,
            AdminActionEnum::DELETE_COMMENT => self::COMMENT_DELETED,
            default => null,
        };
    }

}
