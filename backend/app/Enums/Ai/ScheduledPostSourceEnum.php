<?php

namespace App\Enums\Ai;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum ScheduledPostSourceEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case MANUAL   = 'manual';
    case CALENDAR = 'calendar';

    public function label(): string
    {
        return match ($this) {
            self::MANUAL   => 'Manual',
            self::CALENDAR => 'Calendar',
        };
    }

    public function translate(): string
    {
        return match ($this) {
            self::MANUAL   => 'Thủ công',
            self::CALENDAR => 'Lịch nội dung',
        };
    }
}
