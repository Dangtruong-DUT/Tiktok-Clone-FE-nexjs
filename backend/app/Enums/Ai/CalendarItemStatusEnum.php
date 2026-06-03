<?php

namespace App\Enums\Ai;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum CalendarItemStatusEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case IDEA      = 'idea';
    case DRAFT     = 'draft';
    case SCHEDULED = 'scheduled';
    case PUBLISHED = 'published';

    public function label(): string
    {
        return match ($this) {
            self::IDEA      => 'Idea',
            self::DRAFT     => 'Draft',
            self::SCHEDULED => 'Scheduled',
            self::PUBLISHED => 'Published',
        };
    }

    public function translate(): string
    {
        return match ($this) {
            self::IDEA      => 'Ý tưởng',
            self::DRAFT     => 'Bản nháp',
            self::SCHEDULED => 'Đã lên lịch',
            self::PUBLISHED => 'Đã đăng',
        };
    }
}
