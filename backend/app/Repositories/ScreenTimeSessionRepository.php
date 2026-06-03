<?php

namespace App\Repositories;

use App\Models\ScreenTimeSession;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<ScreenTimeSession>
 */
class ScreenTimeSessionRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(new ScreenTimeSession());
    }

    public function findByUuidAndUserOrFail(string $uuid, int $userId): ScreenTimeSession
    {
        /** @var ScreenTimeSession */
        return $this->query()
            ->where('uuid', $uuid)
            ->where('user_id', $userId)
            ->firstOrFail();
    }

    public function findActiveForUser(int $userId): ?ScreenTimeSession
    {
        /** @var ScreenTimeSession|null */
        return $this->query()
            ->where('user_id', $userId)
            ->whereNull('ended_at')
            ->latest('started_at')
            ->first();
    }

    /** Returns sessions grouped by date for aggregation. */
    public function getInRange(int $userId, Carbon $from, Carbon $to): Collection
    {
        return $this->query()
            ->where('user_id', $userId)
            ->where('started_at', '>=', $from)
            ->where('started_at', '<=', $to)
            ->whereNotNull('ended_at')
            ->orderBy('started_at')
            ->get();
    }

    public function sumSecondsInRange(int $userId, Carbon $from, Carbon $to): int
    {
        return (int) $this->query()
            ->where('user_id', $userId)
            ->where('started_at', '>=', $from)
            ->where('started_at', '<=', $to)
            ->whereNotNull('duration_seconds')
            ->sum('duration_seconds');
    }

    public function sumVideoSecondsInRange(int $userId, Carbon $from, Carbon $to): int
    {
        return (int) $this->query()
            ->where('user_id', $userId)
            ->where('started_at', '>=', $from)
            ->where('started_at', '<=', $to)
            ->sum('video_seconds');
    }

    public function countInRange(int $userId, Carbon $from, Carbon $to): int
    {
        return $this->query()
            ->where('user_id', $userId)
            ->where('started_at', '>=', $from)
            ->where('started_at', '<=', $to)
            ->whereNotNull('ended_at')
            ->count();
    }
}
