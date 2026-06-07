<?php

namespace App\Services\Analytics\Tools;

use App\Services\Analytics\Tools\Contracts\AnalyticsToolInterface;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

/**
 * Base class for all SNAPI analytics tools.
 * Subclasses must not call Gemini or perform HTTP requests.
 */
abstract class AbstractAnalyticsTool implements AnalyticsToolInterface
{
    /**
     * Resolve a Carbon date range from a period string.
     *
     * @param  string  $period  One of the valid periods in config('analytics.periods')
     * @return array{from: Carbon, to: Carbon}
     */
    protected function resolveDateRange(string $period): array
    {
        $now = Carbon::now();

        return match ($period) {
            'today'            => ['from' => $now->copy()->startOfDay(),            'to' => $now->copy()->endOfDay()],
            'yesterday'        => ['from' => $now->copy()->subDay()->startOfDay(),   'to' => $now->copy()->subDay()->endOfDay()],
            'last_7_days'      => ['from' => $now->copy()->subDays(6)->startOfDay(), 'to' => $now->copy()->endOfDay()],
            'current_week'     => ['from' => $now->copy()->startOfWeek(),            'to' => $now->copy()->endOfWeek()],
            'previous_week'    => ['from' => $now->copy()->subWeek()->startOfWeek(), 'to' => $now->copy()->subWeek()->endOfWeek()],
            'current_month'    => ['from' => $now->copy()->startOfMonth(),           'to' => $now->copy()->endOfMonth()],
            'previous_month'   => ['from' => $now->copy()->subMonth()->startOfMonth(), 'to' => $now->copy()->subMonth()->endOfMonth()],
            'last_30_days'     => ['from' => $now->copy()->subDays(29)->startOfDay(), 'to' => $now->copy()->endOfDay()],
            'current_quarter'  => ['from' => $now->copy()->startOfQuarter(),         'to' => $now->copy()->endOfQuarter()],
            'last_90_days'     => ['from' => $now->copy()->subDays(89)->startOfDay(), 'to' => $now->copy()->endOfDay()],
            'current_year'     => ['from' => $now->copy()->startOfYear(),             'to' => $now->copy()->endOfYear()],
            'previous_year'    => ['from' => $now->copy()->subYear()->startOfYear(),  'to' => $now->copy()->subYear()->endOfYear()],
            default            => ['from' => $now->copy()->subDays(6)->startOfDay(),  'to' => $now->copy()->endOfDay()],
        };
    }

    /**
     * Calculate percentage change between two numeric values.
     * Returns null when $previous is zero to avoid division-by-zero.
     *
     * @param  int|float  $current
     * @param  int|float  $previous
     * @return float|null
     */
    protected function changePercent(int|float $current, int|float $previous): ?float
    {
        if ($previous == 0) {
            return null;
        }

        return round(($current - $previous) / $previous * 100, 1);
    }

    /**
     * Build a zero-filled daily series keyed by date string (Y-m-d) for the given range.
     *
     * @param  Carbon  $from
     * @param  Carbon  $to
     * @return array<string, int>
     */
    protected function buildDailySeries(Carbon $from, Carbon $to): array
    {
        $series = [];
        $period = CarbonPeriod::create($from->copy()->startOfDay(), '1 day', $to->copy()->endOfDay());

        foreach ($period as $date) {
            $series[$date->format('Y-m-d')] = 0;
        }

        return $series;
    }
}
