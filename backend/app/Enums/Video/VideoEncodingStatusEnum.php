<?php

namespace App\Enums\Video;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum VideoEncodingStatusEnum: int implements BaseEnumInterface
{
    use BaseEnumTrait;

    case PENDING = 0;
    case PROCESSING = 1;
    case READY = 2;
    case FAILED = 3;

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::PROCESSING => 'Processing',
            self::READY => 'Ready',
            self::FAILED => 'Failed',
        };
    }

    public function translate(): string
    {
        return match ($this) {
            self::PENDING => 'Chờ xử lý',
            self::PROCESSING => 'Đang xử lý',
            self::READY => 'Sẵn sàng',
            self::FAILED => 'Thất bại',
        };
    }
}
