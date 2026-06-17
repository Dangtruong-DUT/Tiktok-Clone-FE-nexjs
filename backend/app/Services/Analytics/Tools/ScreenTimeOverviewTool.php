<?php

namespace App\Services\Analytics\Tools;

use App\Repositories\ScreenTimeSessionRepository;

/**
 * Session duration, video watch time ratio, daily usage trend, and peak hour.
 */
class ScreenTimeOverviewTool extends AbstractAnalyticsTool
{
    public function __construct(private readonly ScreenTimeSessionRepository $screenTimeRepo) {}

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

        $totalSeconds  = $this->screenTimeRepo->sumSecondsInRange($userId, $range['from'], $range['to']);
        $sessionCount  = $this->screenTimeRepo->countInRange($userId, $range['from'], $range['to']);
        $videoSeconds  = $this->screenTimeRepo->sumVideoSecondsInRange($userId, $range['from'], $range['to']);

        $avgSession = $sessionCount > 0 ? round($totalSeconds / $sessionCount) : 0;
        $videoRatio = $totalSeconds > 0 ? round($videoSeconds / $totalSeconds * 100, 1) : 0.0;

        $peakHour    = $this->screenTimeRepo->getPeakHour($userId, $range['from'], $range['to']);
        $dailyRows   = $this->screenTimeRepo->getDailySeries($userId, $range['from'], $range['to']);

        $dailySeries = $this->buildDailySeries($range['from'], $range['to']);
        foreach ($dailyRows as $date => $seconds) {
            if (isset($dailySeries[$date])) {
                $dailySeries[$date] = $seconds;
            }
        }

        $commentSeconds = $this->screenTimeRepo->sumCommentSecondsInRange($userId, $range['from'], $range['to']);
        $postSeconds    = $this->screenTimeRepo->sumPostSecondsInRange($userId, $range['from'], $range['to']);
        $likesSeconds   = $this->screenTimeRepo->sumLikesSecondsInRange($userId, $range['from'], $range['to']);

        $data = [
            'avg_session_duration' => $avgSession,
            'total_screen_time'    => $totalSeconds,
            'video_watch_ratio'    => $videoRatio,
            'daily_series'         => $dailySeries,
            'peak_hour'            => $peakHour,
            'page_time_breakdown'  => [
                'comment_seconds' => $commentSeconds,
                'post_seconds'    => $postSeconds,
                'likes_seconds'   => $likesSeconds,
            ],
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
