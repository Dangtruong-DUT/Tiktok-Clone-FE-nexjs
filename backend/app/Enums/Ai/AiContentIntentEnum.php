<?php

namespace App\Enums\Ai;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum AiContentIntentEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case EDUCATIONAL   = 'educational';
    case ENTERTAINMENT = 'entertainment';
    case REVIEW        = 'review';
    case TUTORIAL      = 'tutorial';
    case VLOG          = 'vlog';
    case PROMOTIONAL   = 'promotional';
    case STORYTELLING  = 'storytelling';
    case NEWS          = 'news';
    case LIFESTYLE     = 'lifestyle';
    case OTHER         = 'other';

    public function label(): string
    {
        return ucfirst($this->value);
    }

    public function translate(): string
    {
        return match ($this) {
            self::EDUCATIONAL   => 'Giáo dục',
            self::ENTERTAINMENT => 'Giải trí',
            self::REVIEW        => 'Đánh giá',
            self::TUTORIAL      => 'Hướng dẫn',
            self::VLOG          => 'Vlog',
            self::PROMOTIONAL   => 'Quảng cáo',
            self::STORYTELLING  => 'Kể chuyện',
            self::NEWS          => 'Tin tức',
            self::LIFESTYLE     => 'Lối sống',
            self::OTHER         => 'Khác',
        };
    }
}
