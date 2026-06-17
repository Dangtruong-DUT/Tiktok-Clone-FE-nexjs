<?php

namespace App\Services\Analytics\Tools;

use App\Enums\Video\VideoEncodingStatusEnum;
use App\Repositories\VideoEncodingRepository;
use Illuminate\Support\Facades\DB;

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

        $errorSummary = DB::table('video_encodings')
            ->where('status', VideoEncodingStatusEnum::FAILED->value)
            ->whereNotNull('error_message')
            ->selectRaw("SUBSTRING(error_message, 1, 100) as pattern, COUNT(*) as cnt")
            ->groupByRaw("SUBSTRING(error_message, 1, 100)")
            ->orderByDesc('cnt')
            ->limit(5)
            ->get()
            ->map(fn ($r) => ['pattern' => $r->pattern, 'count' => (int) $r->cnt])
            ->toArray();

        $data = [
            'pending_jobs'        => $pending,
            'processing_jobs'     => $processing,
            'failed_jobs'         => $failed,
            'stuck_jobs'          => $stuck,
            'avg_processing_time' => $avgProcessingTime,
            'error_summary'       => $errorSummary,
        ];

        if (isset($params['limit'])) {
            $data['items'] = DB::table('video_encodings')
                ->where('status', VideoEncodingStatusEnum::FAILED->value)
                ->orderByDesc('created_at')
                ->limit((int) $params['limit'])
                ->select(['uuid', 'status', 'error_message', 'created_at'])
                ->get()
                ->map(fn ($r) => [
                    'uuid'          => $r->uuid,
                    'status_label'  => 'failed',
                    'error_message' => mb_substr((string) $r->error_message, 0, 100),
                    'created_at'    => $r->created_at,
                ])
                ->toArray();
        }

        return [
            'tool'       => $this->name(),
            'period'     => $params['period'],
            'data'       => $data,
            'compare'    => null,
            'change_pct' => null,
        ];
    }
}
