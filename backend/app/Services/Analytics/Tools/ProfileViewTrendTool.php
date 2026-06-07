<?php

namespace App\Services\Analytics\Tools;

use Illuminate\Support\Facades\DB;

/**
 * Daily profile view counts and trend for the creator.
 */
class ProfileViewTrendTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_profile_view_trend';
    }

    /**
     * @return bool
     */
    public function adminOnly(): bool
    {
        return false;
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

        if ($userId === null) {
            return ['tool' => $this->name(), 'period' => $params['period'], 'data' => [], 'compare' => null, 'change_pct' => null];
        }

        $dailySeries = $this->buildDailySeries($range['from'], $range['to']);

        $rows = DB::table('profile_views')
            ->where('profile_user_id', $userId)
            ->whereBetween('viewed_at', [$range['from'], $range['to']])
            ->selectRaw('DATE(viewed_at) as date, COUNT(*) as cnt')
            ->groupByRaw('DATE(viewed_at)')
            ->pluck('cnt', 'date')
            ->toArray();

        foreach ($rows as $date => $cnt) {
            if (isset($dailySeries[$date])) {
                $dailySeries[$date] = (int) $cnt;
            }
        }

        $totalViews = array_sum($dailySeries);

        $compare   = null;
        $changePct = null;

        if (isset($params['compare_with'])) {
            $cr       = $this->resolveDateRange($params['compare_with']);
            $prevTotal = DB::table('profile_views')
                ->where('profile_user_id', $userId)
                ->whereBetween('viewed_at', [$cr['from'], $cr['to']])
                ->count();
            $compare   = ['total_views' => $prevTotal];
            $changePct = $this->changePercent($totalViews, $prevTotal);
        }

        return [
            'tool'       => $this->name(),
            'period'     => $params['period'],
            'data'       => ['daily_series' => $dailySeries, 'total_views' => $totalViews],
            'compare'    => $compare,
            'change_pct' => $changePct,
        ];
    }
}
