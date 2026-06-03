<?php

namespace App\Enums\Wellness;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum WellnessActionEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case WARNING    = 'warning';
    case SOFT_BLOCK = 'soft_block';

    public function label(): string
    {
        return match ($this) {
            self::WARNING    => 'Show Warning',
            self::SOFT_BLOCK => 'Soft Block',
        };
    }

    public function translate(): string
    {
        return match ($this) {
            self::WARNING    => 'Hiển thị cảnh báo',
            self::SOFT_BLOCK => 'Yêu cầu xác nhận',
        };
    }
}
