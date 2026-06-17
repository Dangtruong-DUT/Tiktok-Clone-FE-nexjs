<?php

namespace App\Services\Analytics\Tools;

use App\Enums\Ai\ScheduledPostStatusEnum;
use App\Repositories\ScheduledPostRepository;
use Illuminate\Support\Facades\DB;

/**
 * Scheduled post counts, publish success rate, avg delay, and source breakdown.
 */
class ScheduledPostMetricsTool extends AbstractAnalyticsTool
{
    public function __construct(private readonly ScheduledPostRepository $scheduledPostRepo) {}

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

        $statusFilter = isset($filters['status']) ? (string) $filters['status'] : null;
        $sourceFilter = isset($filters['source']) ? (string) $filters['source'] : null;

        $statusBreakdown = $this->scheduledPostRepo->getStatusBreakdown(
            $range['from'],
            $range['to'],
            $statusFilter,
            $sourceFilter,
        );

        $total     = array_sum($statusBreakdown);
        $published = $statusBreakdown[ScheduledPostStatusEnum::PUBLISHED->value] ?? 0;
        $failed    = $statusBreakdown[ScheduledPostStatusEnum::FAILED->value] ?? 0;
        $cancelled = $statusBreakdown[ScheduledPostStatusEnum::CANCELLED->value] ?? 0;

        $successRate = $total > 0 ? round($published / $total * 100, 1) : 0.0;

        $avgDelay = $this->scheduledPostRepo->getAvgPublishDelayMinutes(
            $range['from'],
            $range['to'],
            $sourceFilter,
        );

        $sourceBreakdown = DB::table('scheduled_posts')
            ->whereBetween('scheduled_at', [$range['from'], $range['to']])
            ->when($sourceFilter !== null, fn ($q) => $q->where('source', $sourceFilter))
            ->selectRaw('source, COUNT(*) as cnt')
            ->groupBy('source')
            ->pluck('cnt', 'source')
            ->map(fn ($v) => (int) $v)
            ->toArray();

        $data = [
            'scheduled_total'   => $total,
            'published'         => $published,
            'failed'            => $failed,
            'cancelled'         => $cancelled,
            'success_rate'      => $successRate,
            'avg_delay_minutes' => $avgDelay,
            'source_breakdown'  => $sourceBreakdown,
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
