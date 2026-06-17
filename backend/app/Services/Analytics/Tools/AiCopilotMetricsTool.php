<?php

namespace App\Services\Analytics\Tools;

use Illuminate\Support\Facades\DB;

/**
 * AI Copilot session and message stats, top intents, top users by token cost.
 */
class AiCopilotMetricsTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_ai_copilot_metrics';
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

        $query = DB::table('ai_usage_logs')
            ->whereBetween('created_at', [$range['from'], $range['to']]);

        if (isset($filters['intent'])) {
            $query->where('intent', $filters['intent']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $total = (clone $query)->count();

        $topIntents = (clone $query)
            ->whereNotNull('intent')
            ->selectRaw('intent, COUNT(*) as cnt')
            ->groupBy('intent')
            ->orderByDesc('cnt')
            ->limit(10)
            ->pluck('cnt', 'intent')
            ->toArray();

        $topUsersByCost = (clone $query)
            ->whereNotNull('ai_usage_logs.cost_usd')
            ->join('users', 'ai_usage_logs.user_id', '=', 'users.id')
            ->selectRaw('ai_usage_logs.user_id, users.username, COALESCE(SUM(ai_usage_logs.cost_usd), 0) as total_cost')
            ->groupBy('ai_usage_logs.user_id', 'users.username')
            ->orderByDesc('total_cost')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'user_id'        => $row->user_id,
                'username'       => $row->username,
                'total_cost_usd' => round((float) $row->total_cost, 4),
            ])
            ->toArray();

        $dailySeries = (clone $query)
            ->selectRaw("DATE(created_at) as date, COUNT(*) as requests, COALESCE(SUM(cost_usd), 0) as cost_usd")
            ->groupByRaw("DATE(created_at)")
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date'     => $row->date,
                'requests' => (int) $row->requests,
                'cost_usd' => round((float) $row->cost_usd, 6),
            ])
            ->toArray();

        $data = [
            'total_requests'    => $total,
            'top_intents'       => $topIntents,
            'top_users_by_cost' => $topUsersByCost,
            'daily_series'      => $dailySeries,
        ];

        $compare   = null;
        $changePct = null;

        if (isset($params['compare_with'])) {
            $cr       = $this->resolveDateRange($params['compare_with']);
            $prevTotal = DB::table('ai_usage_logs')->whereBetween('created_at', [$cr['from'], $cr['to']])->count();
            $compare   = ['total_requests' => $prevTotal];
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
