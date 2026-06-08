<?php

namespace App\Services\Analytics\Tools;

use Illuminate\Support\Facades\DB;

/**
 * Laravel queue job failures: total failed, by queue name, top failure messages.
 */
class QueueFailureTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_queue_failure_stats';
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

        $query = DB::table('failed_jobs')
            ->whereBetween('failed_at', [$range['from'], $range['to']]);

        if (isset($filters['queue_name'])) {
            $query->where('queue', $filters['queue_name']);
        }

        if (isset($filters['job_class'])) {
            $query->where('payload', 'like', '%' . $filters['job_class'] . '%');
        }

        $total = (clone $query)->count();

        $byQueue = (clone $query)
            ->selectRaw('queue, COUNT(*) as cnt')
            ->groupBy('queue')
            ->orderByDesc('cnt')
            ->pluck('cnt', 'queue')
            ->toArray();

        $topErrors = (clone $query)
            ->selectRaw('SUBSTRING(exception, 1, 100) as error_excerpt, COUNT(*) as cnt')
            ->groupByRaw('SUBSTRING(exception, 1, 100)')
            ->orderByDesc('cnt')
            ->limit(5)
            ->get()
            ->map(fn ($row) => ['message' => $row->error_excerpt, 'count' => (int) $row->cnt])
            ->toArray();

        $data = [
            'total_failed_jobs'   => $total,
            'by_queue'            => $byQueue,
            'top_error_messages'  => $topErrors,
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
