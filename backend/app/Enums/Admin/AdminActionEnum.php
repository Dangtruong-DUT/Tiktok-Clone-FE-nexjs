<?php

namespace App\Enums\Admin;

use App\Enums\BaseEnumTrait;
use App\Enums\BaseEnumInterface;

/**
 * Admin actions that can be performed on resources
 * Used for auditing and logging admin operations
 */
enum AdminActionEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case BAN = 'ban';
    case UNBAN = 'unban';
    case DELETE_USER = 'delete_user';

    case HIDE_POST = 'hide_post';
    case UNHIDE_POST = 'unhide_post';
    case DELETE_POST = 'delete_post';

    case DELETE_COMMENT = 'delete_comment';

    case APPROVE_APPEAL = 'approve_appeal';
    case REJECT_APPEAL = 'reject_appeal';

    case UPDATE = 'update';


    /**
     * Get the label of the enum value
     */
    public function label(): string
    {
        return match ($this) {
            self::BAN => 'Ban User',
            self::UNBAN => 'Unban User',
            self::DELETE_USER => 'Delete User',
            self::HIDE_POST => 'Hide Post',
            self::UNHIDE_POST => 'Unhide Post',
            self::DELETE_POST => 'Delete Post',
            self::DELETE_COMMENT => 'Delete Comment',
            self::APPROVE_APPEAL => 'Approve Appeal',
            self::REJECT_APPEAL => 'Reject Appeal',
            self::UPDATE => 'Update',
        };
    }


    /**
     * Get the translated label of the enum value
     */
    public function translate(): string
    {
        return match ($this) {
            self::BAN => 'Khóa tài khoản',
            self::UNBAN => 'Mở khóa tài khoản',
            self::DELETE_USER => 'Xóa người dùng',
            self::HIDE_POST => 'Ẩn bài viết',
            self::UNHIDE_POST => 'Hiện bài viết',
            self::DELETE_POST => 'Xóa bài viết',
            self::DELETE_COMMENT => 'Xóa bình luận',
            self::APPROVE_APPEAL => 'Phê duyệt kháng cáo',
            self::REJECT_APPEAL => 'Từ chối kháng cáo',
            self::UPDATE => 'Cập nhật',
        };
    }
}
