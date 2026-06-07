<?php

namespace App\Services\Analytics\Tools;

use Illuminate\Support\Facades\DB;

/**
 * Session duration, video watch time ratio, daily usage trend, and peak hour.
 */
class ScreenTimeOverviewTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_screen_time_overview';
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

        $sessions = DB::table('screen_time_sessions')
            ->where('user_id', $userId)
            ->whereBetween('started_at', [$range['from'], $range['to']])
            ->selectRaw('COALESCE(SUM(duration_seconds), 0) as total_seconds, COUNT(*) as session_count, COALESCE(SUM(video_watch_seconds), 0) as video_seconds')
            ->first();

        $totalSeconds   = (int) ($sessions->total_seconds ?? 0);
        $sessionCount   = (int) ($sessions->session_count ?? 0);
        $videoSeconds   = (int) ($sessions->video_seconds ?? 0);

        $avgSession    = $sessionCount > 0 ? round($totalSeconds / $sessionCount) : 0;
        $videoRatio    = $totalSeconds > 0 ? round($videoSeconds / $totalSeconds * 100, 1) : 0.0;

        $peakHour = DB::table('screen_time_sessions')
            ->where('user_id', $userId)
            ->whereBetween('started_at', [$range['from'], $range['to']])
            ->selectRaw('EXTRACT(HOUR FROM started_at) as hour, COUNT(*) as cnt')
            ->groupByRaw('EXTRACT(HOUR FROM started_at)')
            ->orderByDesc('cnt')
            ->value('hour');

        $dailySeries = $this->buildDailySeries($range['from'], $range['to']);
        $dailyRows   = DB::table('screen_time_sessions')
            ->where('user_id', $userId)
            ->whereBetween('started_at', [$range['from'], $range['to']])
            ->selectRaw('DATE(started_at) as date, COALESCE(SUM(duration_seconds), 0) as seconds')
            ->groupByRaw('DATE(started_at)')
            ->pluck('seconds', 'date')
            ->toArray();

        foreach ($dailyRows as $date => $seconds) {
            if (isset($dailySeries[$date])) {
                $dailySeries[$date] = (int) $seconds;
            }
        }

        $data = [
            'avg_session_duration' => $avgSession,
            'total_screen_time'    => $totalSeconds,
            'video_watch_ratio'    => $videoRatio,
            'daily_series'         => $dailySeries,
            'peak_hour'            => $peakHour !== null ? (int) $peakHour : null,
        ];

        return [
            'tool'       => $this->name(),
            'period'     => $params['period'],
            'data'       => $data,
            'compare'    => null,
            'change_pct' => null,
        ];
    }
}
