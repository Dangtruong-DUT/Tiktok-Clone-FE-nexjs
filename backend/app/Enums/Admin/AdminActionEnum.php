<?php

namespace App\Enums\Admin;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

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
    case RESTORE_USER = 'restore_user';
    case RESET_USER_PASSWORD = 'reset_user_password';
    case SEND_EMAIL_TO_USER = 'send_email_to_user';
    case DELETE_POST = 'delete_post';
    case RESTORE_POST = 'restore_post';
    case DELETE_COMMENT = 'delete_comment';
    case RESTORE_COMMENT = 'restore_comment';
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
            self::RESTORE_USER => 'Restore User',
            self::RESET_USER_PASSWORD => 'Reset User Password',
            self::SEND_EMAIL_TO_USER => 'Send Email To User',
            self::DELETE_POST => 'Delete Post',
            self::RESTORE_POST => 'Restore Post',
            self::DELETE_COMMENT => 'Delete Comment',
            self::RESTORE_COMMENT => 'Restore Comment',
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
            self::RESTORE_USER => 'Khôi phục người dùng',
            self::RESET_USER_PASSWORD => 'Đặt lại mật khẩu người dùng',
            self::SEND_EMAIL_TO_USER => 'Gửi email cho người dùng',
            self::DELETE_POST => 'Xóa bài viết',
            self::RESTORE_POST => 'Khôi phục bài viết',
            self::DELETE_COMMENT => 'Xóa bình luận',
            self::RESTORE_COMMENT => 'Khôi phục bình luận',
            self::APPROVE_APPEAL => 'Phê duyệt kháng cáo',
            self::REJECT_APPEAL => 'Từ chối kháng cáo',
            self::UPDATE => 'Cập nhật',
        };
    }
}
