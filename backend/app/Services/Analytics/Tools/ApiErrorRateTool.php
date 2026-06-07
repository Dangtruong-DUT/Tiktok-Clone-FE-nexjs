<?php

namespace App\Services\Analytics\Tools;

use Illuminate\Support\Facades\DB;

/**
 * API error counts (4xx, 5xx) and error rate trend.
 */
class ApiErrorRateTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_api_error_rate';
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

        $query = DB::table('api_request_logs')
            ->whereBetween('created_at', [$range['from'], $range['to']])
            ->where('status_code', '>=', 400);

        if (isset($filters['status_code'])) {
            $query->where('status_code', $filters['status_code']);
        }

        if (isset($filters['endpoint'])) {
            $query->where('endpoint', 'like', '%' . $filters['endpoint'] . '%');
        }

        $errorCount = (clone $query)->count();

        $totalRequests = DB::table('api_request_logs')
            ->whereBetween('created_at', [$range['from'], $range['to']])
            ->count();

        $errorRate = $totalRequests > 0
            ? round($errorCount / $totalRequests * 100, 2)
            : 0.0;

        $byStatusCode = (clone $query)
            ->selectRaw('status_code, COUNT(*) as cnt')
            ->groupBy('status_code')
            ->orderByDesc('cnt')
            ->pluck('cnt', 'status_code')
            ->toArray();

        $dailySeries = $this->buildDailySeries($range['from'], $range['to']);
        $dailyRows   = (clone $query)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as cnt')
            ->groupByRaw('DATE(created_at)')
            ->pluck('cnt', 'date')
            ->toArray();

        foreach ($dailyRows as $date => $cnt) {
            if (isset($dailySeries[$date])) {
                $dailySeries[$date] = (int) $cnt;
            }
        }

        $data = [
            'error_count'    => $errorCount,
            'error_rate'     => $errorRate,
            'by_status_code' => $byStatusCode,
            'daily_series'   => $dailySeries,
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
