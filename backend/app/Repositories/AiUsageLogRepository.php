<?php

namespace App\Repositories;

use App\Models\AiUsageLog;
use Illuminate\Support\Facades\DB;

/**
 * @extends BaseRepository<AiUsageLog>
 */
class AiUsageLogRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(new AiUsageLog());
    }

    public function metricsByPeriod(string $period = 'today'): array
    {
        $from = match ($period) {
            'today'  => now()->startOfDay(),
            'week'   => now()->startOfWeek(),
            'month'  => now()->startOfMonth(),
            default  => now()->startOfDay(),
        };

        return $this->query()
            ->where('created_at', '>=', $from)
            ->selectRaw('
                COUNT(*) as total_requests,
                SUM(total_tokens) as total_tokens,
                SUM(cost_usd) as total_cost,
                intent,
                COUNT(DISTINCT user_id) as unique_users
            ')
            ->groupBy('intent')
            ->get()
            ->toArray();
    }

    public function dailySeries(int $days = 30): array
    {
        return $this->query()
            ->where('created_at', '>=', now()->subDays($days))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as requests, SUM(total_tokens) as tokens, SUM(cost_usd) as cost')
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    public function topUsersByUsage(int $limit = 10): array
    {
        return $this->query()
            ->selectRaw('user_id, COUNT(*) as requests, SUM(total_tokens) as tokens, SUM(cost_usd) as cost')
            ->groupBy('user_id')
            ->orderByDesc('tokens')
            ->limit($limit)
            ->get()
            ->toArray();
    }
}
