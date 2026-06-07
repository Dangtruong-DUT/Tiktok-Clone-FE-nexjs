<?php

namespace App\Services\Analytics\Tools;

use Illuminate\Support\Facades\DB;

/**
 * Scheduled post counts, publish success rate, avg delay, and source breakdown.
 */
class ScheduledPostMetricsTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_scheduled_post_metrics';
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
        $range   = $this->resolveDateRange($params['period']);
        $filters = (array) ($params['filters'] ?? []);

        $query = DB::table('scheduled_posts')
            ->whereBetween('scheduled_at', [$range['from'], $range['to']]);

        if (! $isAdmin && $userId !== null) {
            $query->where('user_id', $userId);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['source'])) {
            $query->where('source', $filters['source']);
        }

        $statusBreakdown = (clone $query)
            ->selectRaw('status, COUNT(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status')
            ->toArray();

        $total     = array_sum($statusBreakdown);
        $published = (int) ($statusBreakdown['published'] ?? 0);
        $failed    = (int) ($statusBreakdown['failed'] ?? 0);
        $cancelled = (int) ($statusBreakdown['cancelled'] ?? 0);

        $successRate = $total > 0 ? round($published / $total * 100, 1) : 0.0;

        $avgDelay = (clone $query)
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (published_at - scheduled_at)) / 60) as avg_delay')
            ->value('avg_delay');

        $data = [
            'scheduled_total' => $total,
            'published'       => $published,
            'failed'          => $failed,
            'cancelled'       => $cancelled,
            'success_rate'    => $successRate,
            'avg_delay_minutes' => $avgDelay !== null ? round((float) $avgDelay, 1) : null,
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
