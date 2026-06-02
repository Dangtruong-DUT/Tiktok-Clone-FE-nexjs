<?php

namespace App\Enums\Ai;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum ScheduledPostStatusEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case PENDING    = 'pending';
    case PROCESSING = 'processing';
    case PUBLISHED  = 'published';
    case FAILED     = 'failed';
    case CANCELLED  = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::PENDING    => 'Pending',
            self::PROCESSING => 'Processing',
            self::PUBLISHED  => 'Published',
            self::FAILED     => 'Failed',
            self::CANCELLED  => 'Cancelled',
        };
    }

    public function translate(): string
    {
        return match ($this) {
            self::PENDING    => 'Chờ xử lý',
            self::PROCESSING => 'Đang xử lý',
            self::PUBLISHED  => 'Đã đăng',
            self::FAILED     => 'Thất bại',
            self::CANCELLED  => 'Đã hủy',
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::PUBLISHED, self::FAILED, self::CANCELLED], true);
    }
}
