<?php

namespace App\Services\Analytics\Tools;

use Illuminate\Support\Facades\DB;

/**
 * Appeal SLA metrics: oldest pending age, average resolution time, backlog count.
 */
class AppealSlaTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_appeal_sla_metrics';
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
        $pendingCount = DB::table('appeals')->where('status', 'pending')->count();

        $oldestPending = DB::table('appeals')
            ->where('status', 'pending')
            ->orderBy('created_at')
            ->value('created_at');

        $oldestDays = $oldestPending
            ? (int) now()->diffInDays($oldestPending)
            : null;

        $avgResolutionHours = DB::table('appeals')
            ->whereIn('status', ['approved', 'rejected'])
            ->whereNotNull('resolved_at')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as avg_hours')
            ->value('avg_hours');

        $data = [
            'pending_count'          => $pendingCount,
            'oldest_pending_days'    => $oldestDays,
            'avg_resolution_hours'   => $avgResolutionHours !== null ? round((float) $avgResolutionHours, 1) : null,
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
