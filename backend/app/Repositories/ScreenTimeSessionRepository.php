<?php

namespace App\Repositories;

use App\Models\ScreenTimeSession;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<ScreenTimeSession>
 */
class ScreenTimeSessionRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(app()->make(ScreenTimeSession::class));
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

    public function sumCommentSecondsInRange(int $userId, Carbon $from, Carbon $to): int
    {
        return (int) $this->query()
            ->where('user_id', $userId)
            ->where('started_at', '>=', $from)
            ->where('started_at', '<=', $to)
            ->sum('comment_seconds');
    }

    public function sumPostSecondsInRange(int $userId, Carbon $from, Carbon $to): int
    {
        return (int) $this->query()
            ->where('user_id', $userId)
            ->where('started_at', '>=', $from)
            ->where('started_at', '<=', $to)
            ->sum('post_seconds');
    }

    public function sumLikesSecondsInRange(int $userId, Carbon $from, Carbon $to): int
    {
        return (int) $this->query()
            ->where('user_id', $userId)
            ->where('started_at', '>=', $from)
            ->where('started_at', '<=', $to)
            ->sum('likes_seconds');
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

    /**
     * Get the hour of day (0–23) with the most sessions in the given range.
     *
     * @param  Carbon  $from
     * @param  Carbon  $to
     */
    public function getPeakHour(int $userId, Carbon $from, Carbon $to): ?int
    {
        $value = $this->buildSearchQuery($userId, $from, $to)
            ->selectRaw('EXTRACT(HOUR FROM started_at) as hour, COUNT(*) as cnt')
            ->groupByRaw('EXTRACT(HOUR FROM started_at)')
            ->orderByDesc('cnt')
            ->value('hour');

        return $value !== null ? (int) $value : null;
    }

    /**
     * Get daily total duration in seconds for a date range.
     *
     * @param  Carbon  $from
     * @param  Carbon  $to
     * @return array<string, int>  date (Y-m-d) => seconds
     */
    public function getDailySeries(int $userId, Carbon $from, Carbon $to): array
    {
        return $this->buildSearchQuery($userId, $from, $to)
            ->selectRaw('DATE(started_at) as date, COALESCE(SUM(duration_seconds), 0) as seconds')
            ->groupByRaw('DATE(started_at)')
            ->pluck('seconds', 'date')
            ->map(fn ($s) => (int) $s)
            ->toArray();
    }

    /**
     * Base query scoped to a user and date range (shared by analytics methods).
     *
     * @param  Carbon  $from
     * @param  Carbon  $to
     */
    private function buildSearchQuery(int $userId, Carbon $from, Carbon $to): Builder
    {
        return $this->query()
            ->where('user_id', $userId)
            ->whereBetween('started_at', [$from, $to]);
    }
}
