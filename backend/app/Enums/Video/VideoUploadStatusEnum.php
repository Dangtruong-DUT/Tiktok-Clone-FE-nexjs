<?php

namespace App\Enums\Video;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum VideoUploadStatusEnum: int implements BaseEnumInterface
{
    use BaseEnumTrait;

    case PENDING     = 0;
    case UPLOADING   = 1;
    case UPLOADED    = 2;
    case ANALYZING   = 3;
    case TRANSCODING = 4;
    case READY       = 5;
    case FAILED      = 6;
    case CANCELED    = 7;

    public function label(): string
    {
        return match ($this) {
            self::PENDING     => 'Pending',
            self::UPLOADING   => 'Uploading',
            self::UPLOADED    => 'Processing',
            self::ANALYZING   => 'Analyzing',
            self::TRANSCODING => 'Transcoding',
            self::READY       => 'Ready',
            self::FAILED      => 'Failed',
            self::CANCELED    => 'Canceled',
        };
    }

    public function translate(): string
    {
        return match ($this) {
            self::PENDING     => 'Chờ upload',
            self::UPLOADING   => 'Đang upload',
            self::UPLOADED    => 'Đang xử lý',
            self::ANALYZING   => 'Đang phân tích',
            self::TRANSCODING => 'Đang chuyển mã',
            self::READY       => 'Sẵn sàng',
            self::FAILED      => 'Thất bại',
            self::CANCELED    => 'Đã hủy',
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::READY, self::FAILED, self::CANCELED]);
    }

    public function canTransitionTo(self $next): bool
    {
        return match ($this) {
            self::PENDING     => in_array($next, [self::UPLOADING, self::CANCELED]),
            self::UPLOADING   => in_array($next, [self::UPLOADED, self::FAILED, self::CANCELED]),
            self::UPLOADED    => in_array($next, [self::ANALYZING, self::FAILED, self::CANCELED]),
            self::ANALYZING   => in_array($next, [self::TRANSCODING, self::FAILED]),
            self::TRANSCODING => in_array($next, [self::READY, self::FAILED]),
            default           => false,
        };
    }
}
