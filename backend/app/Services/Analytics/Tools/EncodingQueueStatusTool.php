<?php

namespace App\Services\Analytics\Tools;

use Illuminate\Support\Facades\DB;

/**
 * Video encoding queue: pending, processing, failed, stuck jobs, avg processing time.
 */
class EncodingQueueStatusTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_encoding_queue_status';
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
        $filters = (array) ($params['filters'] ?? []);

        $query = DB::table('video_encodings');

        if (isset($filters['resolution'])) {
            $query->where('resolution', $filters['resolution']);
        }

        $statusCounts = (clone $query)
            ->selectRaw('status, COUNT(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status')
            ->toArray();

        $pending    = (int) ($statusCounts[0] ?? 0);
        $processing = (int) ($statusCounts[1] ?? 0);
        $failed     = (int) ($statusCounts[3] ?? 0);

        $stuckThreshold = now()->subHours(2);
        $stuck = (clone $query)
            ->whereIn('status', [0, 1])
            ->where('updated_at', '<', $stuckThreshold)
            ->count();

        $avgProcessingTime = (clone $query)
            ->where('status', 2)
            ->whereNotNull('completed_at')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 60) as avg_minutes')
            ->value('avg_minutes');

        $data = [
            'pending_jobs'         => $pending,
            'processing_jobs'      => $processing,
            'failed_jobs'          => $failed,
            'stuck_jobs'           => $stuck,
            'avg_processing_time'  => $avgProcessingTime !== null ? round((float) $avgProcessingTime, 1) : null,
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
