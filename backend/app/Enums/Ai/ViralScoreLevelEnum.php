<?php

namespace App\Enums\Ai;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum ViralScoreLevelEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case LOW    = 'low';
    case MEDIUM = 'medium';
    case HIGH   = 'high';
    case VIRAL  = 'viral';

    public static function fromScore(float $score): self
    {
        return match (true) {
            $score >= 81 => self::VIRAL,
            $score >= 61 => self::HIGH,
            $score >= 31 => self::MEDIUM,
            default      => self::LOW,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::LOW    => 'Low',
            self::MEDIUM => 'Medium',
            self::HIGH   => 'High',
            self::VIRAL  => 'Viral',
        };
    }

    public function translate(): string
    {
        return match ($this) {
            self::LOW    => 'Thấp',
            self::MEDIUM => 'Trung bình',
            self::HIGH   => 'Cao',
            self::VIRAL  => 'Viral',
        };
    }
}
