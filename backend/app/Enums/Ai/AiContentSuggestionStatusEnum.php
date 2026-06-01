<?php

namespace App\Enums\Ai;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum AiContentSuggestionStatusEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case PENDING    = 'pending';
    case PROCESSING = 'processing';
    case COMPLETED  = 'completed';
    case FAILED     = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::PENDING    => 'Pending',
            self::PROCESSING => 'Processing',
            self::COMPLETED  => 'Completed',
            self::FAILED     => 'Failed',
        };
    }

    public function translate(): string
    {
        return match ($this) {
            self::PENDING    => 'Đang chờ',
            self::PROCESSING => 'Đang xử lý',
            self::COMPLETED  => 'Hoàn thành',
            self::FAILED     => 'Thất bại',
        };
    }
}
