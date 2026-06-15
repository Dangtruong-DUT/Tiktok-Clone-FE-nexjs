<?php

namespace App\Services\ScreenTime;

use App\Enums\Wellness\ScreenTimePeriodEnum;
use App\Exceptions\http\BusinessException;
use App\Models\ScreenTimeSession;
use App\Repositories\ScreenTimeSessionRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ScreenTimeTrackingService
{
    /**
     * Create a new service instance.
     *
     * @param  ScreenTimeSessionRepository  $repository
     */
    public function __construct(
        private readonly ScreenTimeSessionRepository $repository,
    ) {}

    /**
     * Start a new screen-time session for the user.
     *
     * @param  int  $userId
     * @return ScreenTimeSession
     */
    public function startSession(int $userId): ScreenTimeSession
    {
        return DB::transaction(function () use ($userId): ScreenTimeSession {
            // Lock all of this user's open sessions to prevent concurrent race conditions.
            ScreenTimeSession::where('user_id', $userId)
                ->whereNull('ended_at')
                ->lockForUpdate()
                ->get();

            $active = $this->repository->findActiveForUser($userId);

            // Return the existing session if it was created very recently.
            // This makes the endpoint idempotent against React StrictMode double-invoke
            // and rapid re-mounts that would otherwise create back-to-back sessions.
            if ($active && $active->started_at->diffInSeconds(now()) < 120) {
                return $active;
            }

            if ($active) {
                $elapsed = max(0, now()->timestamp - $active->started_at->timestamp);
                $this->repository->update($active->id, [
                    'ended_at'         => now(),
                    'duration_seconds' => $elapsed,
                ]);
            }

            /** @var ScreenTimeSession */
            return $this->repository->create([
                'uuid'              => (string) Str::uuid(),
                'user_id'           => $userId,
                'started_at'        => now(),
                'last_heartbeat_at' => now(),
            ]);
        });
    }

    /**
     * Refresh the heartbeat timestamp for an active session.
     *
     * @param  ScreenTimeSession  $session
     * @return ScreenTimeSession
     */
    public function heartbeat(ScreenTimeSession $session, string $pageType = 'other'): ScreenTimeSession
    {
        if ($session->ended_at !== null) {
            throw new BusinessException(trans('exceptions.wellness.session_ended'));
        }

        $elapsed = (int) min(90, now()->diffInSeconds($session->last_heartbeat_at ?? $session->started_at, true));

        $columnMap = ['comment' => 'comment_seconds', 'posts' => 'post_seconds', 'likes' => 'likes_seconds'];
        $column    = $columnMap[$pageType] ?? null;

        $update = ['last_heartbeat_at' => now()];
        if ($column !== null && $elapsed > 0) {
            $update[$column] = $session->{$column} + $elapsed;
        }

        /** @var ScreenTimeSession */
        return $this->repository->update($session->id, $update);
    }

    /**
     * Retrieve a screen-time session by UUID for the given user.
     *
     * @param  string  $uuid
     * @param  int  $userId
     * @return ScreenTimeSession
     */
    public function getSessionByUuidForUser(string $uuid, int $userId): ScreenTimeSession
    {
        return $this->repository->findByUuidAndUserOrFail($uuid, $userId);
    }

    /**
     * Refresh the heartbeat timestamp for a session identified by UUID.
     *
     * @param  string  $uuid
     * @param  int  $userId
     * @return ScreenTimeSession
     */
    public function heartbeatByUuid(string $uuid, int $userId, string $pageType = 'other'): ScreenTimeSession
    {
        return $this->heartbeat($this->getSessionByUuidForUser($uuid, $userId), $pageType);
    }

    /**
     * Update the watched video seconds for a session.
     *
     * @param  ScreenTimeSession  $session
     * @param  int  $seconds
     * @return ScreenTimeSession
     */
    public function updateVideoTime(ScreenTimeSession $session, int $seconds): ScreenTimeSession
    {
        if ($session->ended_at !== null) {
            throw new BusinessException('Session has already ended.');
        }

        // Cap video_seconds at the session's elapsed wall-clock time to prevent
        // clients from inflating watch-time stats.
        $maxSeconds = (int) now()->diffInSeconds($session->started_at, true);

        /** @var ScreenTimeSession */
        return $this->repository->update($session->id, [
            'video_seconds' => min(max($session->video_seconds, $seconds), $maxSeconds),
        ]);
    }

    /**
     * Update the watched video seconds for a session identified by UUID.
     *
     * @param  string  $uuid
     * @param  int  $userId
     * @param  int  $seconds
     * @return ScreenTimeSession
     */
    public function updateVideoTimeByUuid(string $uuid, int $userId, int $seconds): ScreenTimeSession
    {
        return $this->updateVideoTime($this->getSessionByUuidForUser($uuid, $userId), $seconds);
    }

    /**
     * End a screen-time session.
     *
     * @param  ScreenTimeSession  $session
     * @param  int  $durationSeconds
     * @return ScreenTimeSession
     */
    public function endSession(ScreenTimeSession $session, int $durationSeconds): ScreenTimeSession
    {
        if ($session->ended_at !== null) {
            return $session;
        }

        // Cap client-provided duration at actual server-side elapsed time to prevent
        // clients from submitting inflated durations.
        $serverElapsed = (int) now()->diffInSeconds($session->started_at, true);
        $safeDuration  = min($durationSeconds, $serverElapsed);

        /** @var ScreenTimeSession */
        return $this->repository->update($session->id, [
            'ended_at'         => now(),
            'duration_seconds' => $safeDuration,
        ]);
    }

    /**
     * End a screen-time session identified by UUID.
     *
     * @param  string  $uuid
     * @param  int  $userId
     * @param  int  $durationSeconds
     * @return ScreenTimeSession
     */
    public function endSessionByUuid(string $uuid, int $userId, int $durationSeconds): ScreenTimeSession
    {
        return $this->endSession($this->getSessionByUuidForUser($uuid, $userId), $durationSeconds);
    }

    /**
     * Get aggregated screen-time statistics for a user.
     *
     * @param  int  $userId
     * @param  string|null  $period
     * @return array<string,mixed>
     */
    public function getStats(int $userId, ?string $period = null): array
    {
        $period ??= ScreenTimePeriodEnum::TODAY->value;

        [$from, $days] = match ($period) {
            ScreenTimePeriodEnum::WEEK->value  => [now()->subWeek(),    7],
            ScreenTimePeriodEnum::MONTH->value => [now()->subMonth(), 30],
            default                            => [now()->startOfDay(),  1],
        };

        $to = now();

        $liveSeconds  = $this->getLiveSessionSeconds($userId, $from, $to);
        $totalSeconds = $this->repository->sumSecondsInRange($userId, $from, $to) + $liveSeconds;
        $videoSeconds = $this->repository->sumVideoSecondsInRange($userId, $from, $to);
        $sessions     = $this->repository->countInRange($userId, $from, $to);

        $commentSeconds = $this->repository->sumCommentSecondsInRange($userId, $from, $to);
        $postSeconds    = $this->repository->sumPostSecondsInRange($userId, $from, $to);
        $likesSeconds   = $this->repository->sumLikesSecondsInRange($userId, $from, $to);

        return [
            'period'            => $period,
            'total_seconds'     => $totalSeconds,
            'video_seconds'     => $videoSeconds,
            'sessions_count'    => $sessions,
            'comment_seconds'   => $commentSeconds,
            'post_seconds'      => $postSeconds,
            'likes_seconds'     => $likesSeconds,
            'avg_daily_seconds' => $days > 0 ? (int) round($totalSeconds / $days) : 0,
            'peak_hour'         => $this->getPeakHour($userId, $from, $to),
            'daily_series'      => $this->getDailySeries($userId, $from, $to, $liveSeconds),
        ];
    }

    /**
     * Get daily screen-time history for a user.
     *
     * @param  int  $userId
     * @param  string|null  $dateFrom
     * @param  string|null  $dateTo
     * @return array<int,array<string,mixed>>
     */
    public function getHistory(int $userId, ?string $dateFrom = null, ?string $dateTo = null): array
    {
        $from = $dateFrom
            ? Carbon::parse($dateFrom)->startOfDay()
            : now()->subDays(30)->startOfDay();
        $to = $dateTo
            ? Carbon::parse($dateTo)->endOfDay()
            : now()->endOfDay();

        return $this->getDailySeries($userId, $from, $to, $this->getLiveSessionSeconds($userId, $from, $to));
    }

    /**
     * Elapsed seconds of the user's currently active (not yet ended) session,
     * if it started within the given range. duration_seconds is only persisted
     * once a session ends, so without this the active session contributes 0
     * to "today" stats while it's still open.
     *
     * @param  int  $userId
     * @param  Carbon  $from
     * @param  Carbon  $to
     * @return int
     */
    private function getLiveSessionSeconds(int $userId, Carbon $from, Carbon $to): int
    {
        $active = $this->repository->findActiveForUser($userId);

        if (! $active || ! $active->started_at->between($from, $to)) {
            return 0;
        }

        return (int) now()->diffInSeconds($active->started_at, true);
    }

    private function getPeakHour(int $userId, Carbon $from, Carbon $to): ?int
    {
        $row = DB::table('screen_time_sessions')
            ->where('user_id', $userId)
            ->where('started_at', '>=', $from)
            ->where('started_at', '<=', $to)
            ->whereNull('deleted_at')
            ->selectRaw('EXTRACT(HOUR FROM started_at)::int AS hour, COUNT(*) AS cnt')
            ->groupByRaw('EXTRACT(HOUR FROM started_at)::int')
            ->orderByRaw('COUNT(*) DESC')
            ->first();

        return $row ? (int) $row->hour : null;
    }

    /**
     * @param  int  $userId
     * @param  Carbon  $from
     * @param  Carbon  $to
     * @param  int  $liveSecondsToday  Elapsed seconds of the active session, folded into today's row.
     * @return array<int,array<string,mixed>>
     */
    private function getDailySeries(int $userId, Carbon $from, Carbon $to, int $liveSecondsToday = 0): array
    {
        $series = DB::table('screen_time_sessions')
            ->where('user_id', $userId)
            ->where('started_at', '>=', $from)
            ->where('started_at', '<=', $to)
            ->whereNotNull('duration_seconds')
            ->whereNull('deleted_at')
            ->selectRaw('
                DATE(started_at)              AS date,
                SUM(duration_seconds)         AS seconds,
                SUM(video_seconds)            AS video_seconds
            ')
            ->groupByRaw('DATE(started_at)')
            ->orderByRaw('DATE(started_at)')
            ->get()
            ->map(fn ($row) => [
                'date'          => $row->date,
                'seconds'       => (int) $row->seconds,
                'video_seconds' => (int) $row->video_seconds,
            ])
            ->toArray();

        if ($liveSecondsToday <= 0) {
            return $series;
        }

        $today = now()->toDateString();
        foreach ($series as &$row) {
            if ($row['date'] === $today) {
                $row['seconds'] += $liveSecondsToday;

                return $series;
            }
        }
        unset($row);

        $series[] = ['date' => $today, 'seconds' => $liveSecondsToday, 'video_seconds' => 0];

        return $series;
    }
}
