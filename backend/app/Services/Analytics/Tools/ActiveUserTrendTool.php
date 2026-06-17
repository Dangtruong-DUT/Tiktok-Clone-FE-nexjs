<?php

namespace App\Services\Analytics\Tools;

use Illuminate\Support\Facades\DB;

/**
 * Daily and weekly active users trend for the platform.
 */
class ActiveUserTrendTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_active_user_trend';
    }

    /**
     * @return bool
     */
    public function adminOnly(): bool
    {
        return true;
    }

    /**
     * @param  array<string,mixed>  $params
     * @param  int|null  $userId
     * @param  bool      $isAdmin
     * @return array{tool: string, period: string, data: array<string,mixed>, compare: array<string,mixed>|null, change_pct: float|null}
     */
    public function run(array $params, ?int $userId, bool $isAdmin): array
    {
        $range = $this->resolveDateRange($params['period']);

        $dauSeries = $this->buildDailySeries($range['from'], $range['to']);

        $rows = DB::table('sessions')
            ->whereBetween('last_activity', [$range['from']->timestamp, $range['to']->timestamp])
            ->selectRaw('to_timestamp(last_activity)::date as date, COUNT(DISTINCT user_id) as cnt')
            ->whereNotNull('user_id')
            ->groupByRaw('to_timestamp(last_activity)::date')
            ->pluck('cnt', 'date')
            ->toArray();

        foreach ($rows as $date => $cnt) {
            if (isset($dauSeries[$date])) {
                $dauSeries[$date] = (int) $cnt;
            }
        }

        $wauRows = DB::table('screen_time_sessions')
            ->whereBetween('started_at', [$range['from'], $range['to']])
            ->selectRaw("DATE_TRUNC('week', started_at)::date as week, COUNT(DISTINCT user_id) as cnt")
            ->groupByRaw("DATE_TRUNC('week', started_at)")
            ->orderBy('week')
            ->get()
            ->mapWithKeys(fn ($r) => [(string) $r->week => (int) $r->cnt])
            ->toArray();

        $data = ['dau_series' => $dauSeries, 'wau_series' => $wauRows];

        $compare   = null;
        $changePct = null;

        if (isset($params['compare_with'])) {
            $cr       = $this->resolveDateRange($params['compare_with']);
            $prevAvg  = DB::table('sessions')
                ->whereBetween('last_activity', [$cr['from']->timestamp, $cr['to']->timestamp])
                ->whereNotNull('user_id')
                ->selectRaw('to_timestamp(last_activity)::date as date, COUNT(DISTINCT user_id) as cnt')
                ->groupByRaw('to_timestamp(last_activity)::date')
                ->pluck('cnt')
                ->avg();

            $currAvg = count($dauSeries) > 0 ? array_sum($dauSeries) / count($dauSeries) : 0;
            $compare  = ['avg_dau' => round((float) $prevAvg, 1)];
            $changePct = $this->changePercent($currAvg, (float) $prevAvg);
        }

        return [
            'tool'       => $this->name(),
            'period'     => $params['period'],
            'data'       => $data,
            'compare'    => $compare,
            'change_pct' => $changePct,
        ];
    }
}
