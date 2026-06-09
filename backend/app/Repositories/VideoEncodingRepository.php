<?php

namespace App\Repositories;

use App\Enums\Video\VideoEncodingStatusEnum;
use App\Models\VideoEncoding;
use Illuminate\Database\Eloquent\Builder;

/**
 * @extends BaseRepository<VideoEncoding>
 */
class VideoEncodingRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(app()->make(VideoEncoding::class));
    }

    /**
     * Get a status => count map for all encoding jobs, optionally filtered by resolution.
     *
     * @return array<int, int>  status value => count
     */
    public function getStatusCounts(?string $resolution = null): array
    {
        return $this->buildSearchQuery($resolution)
            ->selectRaw('status, COUNT(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status')
            ->map(fn ($v) => (int) $v)
            ->toArray();
    }

    /**
     * Count jobs that have been pending/processing longer than the given threshold.
     */
    public function countStuck(int $thresholdHours = 2, ?string $resolution = null): int
    {
        return $this->buildSearchQuery($resolution)
            ->whereIn('status', [VideoEncodingStatusEnum::PENDING->value, VideoEncodingStatusEnum::PROCESSING->value])
            ->where('updated_at', '<', now()->subHours($thresholdHours))
            ->count();
    }

    /**
     * Get average processing time in minutes for completed (READY) jobs.
     */
    public function getAvgProcessingMinutes(?string $resolution = null): ?float
    {
        $result = $this->buildSearchQuery($resolution)
            ->where('status', VideoEncodingStatusEnum::READY->value)
            ->whereNotNull('completed_at')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 60) as avg_minutes')
            ->value('avg_minutes');

        return $result !== null ? round((float) $result, 1) : null;
    }

    /**
     * Base query optionally filtered by resolution (shared by queue analytics methods).
     */
    private function buildSearchQuery(?string $resolution): Builder
    {
        return $this->query()
            ->when($resolution !== null, fn (Builder $q) => $q->where('resolution', $resolution));
    }
}
