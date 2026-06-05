<?php

namespace App\Services;

use App\Enums\Admin\ActivityTypeEnum;
use App\Models\ActivityLog;
use App\Models\ScreenTimeSession;
use App\Repositories\ScreenTimeSessionRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ScreenTimeTrackingService
{
    public function __construct(
        private readonly ScreenTimeSessionRepository $repository,
    ) {}

    public function startSession(int $userId): ScreenTimeSession
    {
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
    }

    public function heartbeat(ScreenTimeSession $session): ScreenTimeSession
    {
        /** @var ScreenTimeSession */
        return $this->repository->update($session->id, [
            'last_heartbeat_at' => now(),
        ]);
    }

    public function updateVideoTime(ScreenTimeSession $session, int $seconds): ScreenTimeSession
    {
        /** @var ScreenTimeSession */
        return $this->repository->update($session->id, [
            'video_seconds' => max($session->video_seconds, $seconds),
        ]);
    }

    public function endSession(ScreenTimeSession $session, int $durationSeconds): ScreenTimeSession
    {
        /** @var ScreenTimeSession */
        return $this->repository->update($session->id, [
            'ended_at'         => now(),
            'duration_seconds' => $durationSeconds,
        ]);
    }

    /**
     * @param  'today'|'week'|'month'  $period
     * @return array<string,mixed>
     */
    public function getStats(int $userId, string $period = 'today'): array
    {
        [$from, $days] = match ($period) {
            'week'  => [now()->subWeek(),  7],
            'month' => [now()->subMonth(), 30],
            default => [now()->startOfDay(), 1],
        };

        $to = now();

        $totalSeconds = $this->repository->sumSecondsInRange($userId, $from, $to);
        $videoSeconds = $this->repository->sumVideoSecondsInRange($userId, $from, $to);
        $sessions     = $this->repository->countInRange($userId, $from, $to);

        // Interaction counts from activity_logs (existing data)
        $comments = ActivityLog::where('user_id', $userId)
            ->where('activity_type', ActivityTypeEnum::COMMENT_CREATED->value)
            ->where('created_at', '>=', $from)
            ->count();

        $posts = ActivityLog::where('user_id', $userId)
            ->where('activity_type', ActivityTypeEnum::POST_UPLOADED->value)
            ->where('created_at', '>=', $from)
            ->count();

        $likes = ActivityLog::where('user_id', $userId)
            ->where('activity_type', ActivityTypeEnum::POST_LIKED->value)
            ->where('created_at', '>=', $from)
            ->count();

        return [
            'period'            => $period,
            'total_seconds'     => $totalSeconds,
            'video_seconds'     => $videoSeconds,
            'sessions_count'    => $sessions,
            'comments_count'    => $comments,
            'posts_count'       => $posts,
            'likes_count'       => $likes,
            'avg_daily_seconds' => $days > 0 ? (int) round($totalSeconds / $days) : 0,
            'peak_hour'         => $this->getPeakHour($userId, $from, $to),
            'daily_series'      => $this->getDailySeries($userId, $from, $to),
        ];
    }

    /** @return array<int,array<string,mixed>> */
    public function getHistory(int $userId, Carbon $from, Carbon $to): array
    {
        return $this->getDailySeries($userId, $from, $to);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

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

    /** @return array<int,array<string,mixed>> */
    private function getDailySeries(int $userId, Carbon $from, Carbon $to): array
    {
        return DB::table('screen_time_sessions')
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
    }
}
