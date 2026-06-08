<?php

namespace App\Enums\Post;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum PostPublishStatusEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case DRAFT     = 'draft';
    case SCHEDULED = 'scheduled';
    case PUBLISHED = 'published';
    case FAILED    = 'failed';
    case ARCHIVED  = 'archived';
    case HIDDEN    = 'hidden';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT     => 'Draft',
            self::SCHEDULED => 'Scheduled',
            self::PUBLISHED => 'Published',
            self::FAILED    => 'Failed',
            self::ARCHIVED  => 'Archived',
            self::HIDDEN    => 'Hidden',
        };
    }

    public function translate(): string
    {
        return match ($this) {
            self::DRAFT     => 'Bản nháp',
            self::SCHEDULED => 'Đã lên lịch',
            self::PUBLISHED => 'Đã đăng',
            self::FAILED    => 'Thất bại',
            self::ARCHIVED  => 'Đã lưu trữ',
            self::HIDDEN    => 'Đã ẩn',
        };
    }

    public function isPubliclyVisible(): bool
    {
        return $this === self::PUBLISHED;
    }

    public function isOwnerVisible(): bool
    {
        return in_array($this, [self::DRAFT, self::SCHEDULED, self::PUBLISHED, self::FAILED], true);
    }
}
