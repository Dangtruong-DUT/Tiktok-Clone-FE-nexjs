<?php

namespace App\Enums\Admin;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

/**
 * System activity types for monitoring and auditing
 * Tracks all significant events happening in the system
 */
enum ActivityTypeEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case USER_CREATED = 'user_created';
    case USER_REGISTERED = 'user_registered';
    case USER_VERIFIED = 'user_verified';
    case USER_BANNED = 'user_banned';
    case USER_UNBANNED = 'user_unbanned';

    case POST_UPLOADED = 'post_uploaded';
    case POST_DELETED = 'post_deleted';

    case POST_LIKED = 'post_liked';
    case POST_UNLIKED = 'post_unliked';
    case POST_BOOKMARKED = 'post_bookmarked';
    case COMMENT_CREATED = 'comment_created';
    case COMMENT_DELETED = 'comment_deleted';

    case USER_FOLLOWED = 'user_followed';
    case USER_UNFOLLOWED = 'user_unfollowed';

    case LOGIN = 'login';
    case LOGOUT = 'logout';
    case PASSWORD_CHANGED = 'password_changed';

    /**
     * Get the label of the enum value
     */
    public function label(): string
    {
        return match ($this) {
            self::USER_CREATED => 'User Created',
            self::USER_REGISTERED => 'User Registered',
            self::USER_VERIFIED => 'User Verified',
            self::USER_BANNED => 'User Banned',
            self::USER_UNBANNED => 'User Unbanned',
            self::POST_UPLOADED => 'Post Uploaded',
            self::POST_DELETED => 'Post Deleted',
            self::POST_LIKED => 'Post Liked',
            self::POST_UNLIKED => 'Post Unliked',
            self::POST_BOOKMARKED => 'Post Bookmarked',
            self::COMMENT_CREATED => 'Comment Created',
            self::COMMENT_DELETED => 'Comment Deleted',
            self::USER_FOLLOWED => 'User Followed',
            self::USER_UNFOLLOWED => 'User Unfollowed',
            self::LOGIN => 'Login',
            self::LOGOUT => 'Logout',
            self::PASSWORD_CHANGED => 'Password Changed',
        };
    }

    /**
     * Get the translated label of the enum value
     */
    public function translate(): string
    {
        return match ($this) {
            self::USER_CREATED => 'Người dùng được tạo',
            self::USER_REGISTERED => 'Người dùng đăng ký',
            self::USER_VERIFIED => 'Người dùng được xác minh',
            self::USER_BANNED => 'Người dùng bị khóa',
            self::USER_UNBANNED => 'Người dùng được mở khóa',
            self::POST_UPLOADED => 'Bài viết được tải lên',
            self::POST_DELETED => 'Bài viết bị xóa',
            self::POST_LIKED => 'Bài viết được thích',
            self::POST_UNLIKED => 'Bài viết bị bỏ thích',
            self::POST_BOOKMARKED => 'Bài viết được lưu',
            self::COMMENT_CREATED => 'Bình luận được tạo',
            self::COMMENT_DELETED => 'Bình luận bị xóa',
            self::USER_FOLLOWED => 'Người dùng được theo dõi',
            self::USER_UNFOLLOWED => 'Người dùng bỏ theo dõi',
            self::LOGIN => 'Đăng nhập',
            self::LOGOUT => 'Đăng xuất',
            self::PASSWORD_CHANGED => 'Mật khẩu được thay đổi',
        };
    }
}
