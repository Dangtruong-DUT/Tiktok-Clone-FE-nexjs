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

    /**
     * Find a screen-time session by UUID for a user or fail.
     *
     * @param  string  $uuid
     * @param  int  $userId
     * @return ScreenTimeSession
     */
    public function findByUuidAndUserOrFail(string $uuid, int $userId): ScreenTimeSession
    {
        /** @var ScreenTimeSession */
        return $this->query()
            ->where('uuid', $uuid)
            ->where('user_id', $userId)
            ->firstOrFail();
    }

    /**
     * Find the active screen-time session for a user.
     *
     * @param  int  $userId
     * @return ScreenTimeSession|null
     */
    public function findActiveForUser(int $userId): ?ScreenTimeSession
    {
        /** @var ScreenTimeSession|null */
        return $this->query()
            ->where('user_id', $userId)
            ->whereNull('ended_at')
            ->latest('started_at')
            ->first();
    }

    /**
     * Get ended sessions in a date range for aggregation.
     *
     * @param  int  $userId
     * @param  Carbon  $from
     * @param  Carbon  $to
     * @return Collection<int, ScreenTimeSession>
     */
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

    /**
     * Sum duration seconds in a date range.
     *
     * @param  int  $userId
     * @param  Carbon  $from
     * @param  Carbon  $to
     * @return int
     */
    public function sumSecondsInRange(int $userId, Carbon $from, Carbon $to): int
    {
        return (int) $this->query()
            ->where('user_id', $userId)
            ->where('started_at', '>=', $from)
            ->where('started_at', '<=', $to)
            ->whereNotNull('duration_seconds')
            ->sum('duration_seconds');
    }

    /**
     * Sum video seconds in a date range.
     *
     * @param  int  $userId
     * @param  Carbon  $from
     * @param  Carbon  $to
     * @return int
     */
    public function sumVideoSecondsInRange(int $userId, Carbon $from, Carbon $to): int
    {
        return (int) $this->query()
            ->where('user_id', $userId)
            ->where('started_at', '>=', $from)
            ->where('started_at', '<=', $to)
            ->sum('video_seconds');
    }

    /**
     * Count ended sessions in a date range.
     *
     * @param  int  $userId
     * @param  Carbon  $from
     * @param  Carbon  $to
     * @return int
     */
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
