<?php

namespace App\Services\Analytics\Tools;

use Illuminate\Support\Facades\DB;

/**
 * AI Studio token usage, cost (USD), success rate, intent breakdown, daily cost series.
 */
class AiStudioMetricsTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_ai_studio_metrics';
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

        $query = DB::table('ai_usage_logs')
            ->whereBetween('created_at', [$range['from'], $range['to']]);

        if (! $isAdmin && $userId !== null) {
            $query->where('user_id', $userId);
        }

        if (isset($filters['intent'])) {
            $query->where('intent', $filters['intent']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $agg = (clone $query)->selectRaw(
            "COALESCE(SUM((token_usage->>'total_tokens')::int), 0) as total_tokens,
             COALESCE(SUM(cost_usd), 0) as total_cost_usd,
             COUNT(*) as total_requests,
             COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count"
        )->first();

        $total       = (int) ($agg->total_requests ?? 0);
        $successRate = $total > 0 ? round((int) ($agg->success_count ?? 0) / $total * 100, 1) : 0.0;

        $intentBreakdown = (clone $query)
            ->whereNotNull('intent')
            ->selectRaw('intent, COUNT(*) as cnt')
            ->groupBy('intent')
            ->orderByDesc('cnt')
            ->limit(10)
            ->pluck('cnt', 'intent')
            ->toArray();

        $data = [
            'total_tokens'     => (int) ($agg->total_tokens ?? 0),
            'total_cost_usd'   => round((float) ($agg->total_cost_usd ?? 0), 4),
            'total_requests'   => $total,
            'success_rate'     => $successRate,
            'intent_breakdown' => $intentBreakdown,
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
