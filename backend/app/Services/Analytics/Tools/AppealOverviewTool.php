<?php

namespace App\Services\Analytics\Tools;

use Illuminate\Support\Facades\DB;

/**
 * Appeal counts: total, approved, rejected, pending, approval rate by type.
 */
class AppealOverviewTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_appeal_overview';
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
        $range   = $this->resolveDateRange($params['period']);
        $filters = (array) ($params['filters'] ?? []);

        $query = DB::table('appeals')
            ->whereBetween('created_at', [$range['from'], $range['to']]);

        if (isset($filters['appeal_status'])) {
            $query->where('status', $filters['appeal_status']);
        }

        if (isset($filters['resource_type'])) {
            $query->where('resource_type', $filters['resource_type']);
        }

        if (isset($filters['creator_id'])) {
            $query->where('user_id', $filters['creator_id']);
        }

        if (isset($filters['post_id'])) {
            $query->where('resource_type', 'post')->where('resource_id', $filters['post_id']);
        }

        $statusBreakdown = (clone $query)
            ->selectRaw('status, COUNT(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status')
            ->toArray();

        $total    = array_sum($statusBreakdown);
        $approved = (int) ($statusBreakdown['approved'] ?? 0);
        $rejected = (int) ($statusBreakdown['rejected'] ?? 0);
        $pending  = (int) ($statusBreakdown['pending'] ?? 0);

        $approvalRate = ($approved + $rejected) > 0
            ? round($approved / ($approved + $rejected) * 100, 1)
            : 0.0;

        $data = [
            'total_appeals' => $total,
            'approved'      => $approved,
            'rejected'      => $rejected,
            'pending'       => $pending,
            'approval_rate' => $approvalRate,
        ];

        $compare   = null;
        $changePct = null;

        if (isset($params['compare_with'])) {
            $cr       = $this->resolveDateRange($params['compare_with']);
            $prevTotal = DB::table('appeals')->whereBetween('created_at', [$cr['from'], $cr['to']])->count();
            $compare   = ['total_appeals' => $prevTotal];
            $changePct = $this->changePercent($total, $prevTotal);
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
