<?php

namespace App\DTOs\AI;

final readonly class ScreenTimeData
{
    public function __construct(
        public int $todayTotalSeconds,
        public int $todayVideoSeconds,
        public int $weekTotalSeconds,
        public int $weekVideoSeconds,
        public int $todaySessions,
    ) {}

    public function todayTotalFormatted(): string
    {
        return $this->formatSeconds($this->todayTotalSeconds);
    }

    public function weekTotalFormatted(): string
    {
        return $this->formatSeconds($this->weekTotalSeconds);
    }

    private function formatSeconds(int $seconds): string
    {
        $h = intdiv($seconds, 3600);
        $m = intdiv($seconds % 3600, 60);

        if ($h > 0) {
            return "{$h} giờ {$m} phút";
        }

        return "{$m} phút";
    }
}
