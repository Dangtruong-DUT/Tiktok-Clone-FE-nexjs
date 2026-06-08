<?php

namespace App\Services\Analytics\Tools;

use App\Enums\Video\VideoEncodingStatusEnum;
use App\Repositories\VideoEncodingRepository;

/**
 * Video encoding queue: pending, processing, failed, stuck jobs, avg processing time.
 */
class EncodingQueueStatusTool extends AbstractAnalyticsTool
{
    public function __construct(private readonly VideoEncodingRepository $encodingRepo) {}

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
        $filters    = (array) ($params['filters'] ?? []);
        $resolution = isset($filters['resolution']) ? (string) $filters['resolution'] : null;

        $statusCounts = $this->encodingRepo->getStatusCounts($resolution);

        $pending    = $statusCounts[VideoEncodingStatusEnum::PENDING->value] ?? 0;
        $processing = $statusCounts[VideoEncodingStatusEnum::PROCESSING->value] ?? 0;
        $failed     = $statusCounts[VideoEncodingStatusEnum::FAILED->value] ?? 0;

        $stuck             = $this->encodingRepo->countStuck(2, $resolution);
        $avgProcessingTime = $this->encodingRepo->getAvgProcessingMinutes($resolution);

        $data = [
            'pending_jobs'        => $pending,
            'processing_jobs'     => $processing,
            'failed_jobs'         => $failed,
            'stuck_jobs'          => $stuck,
            'avg_processing_time' => $avgProcessingTime,
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
