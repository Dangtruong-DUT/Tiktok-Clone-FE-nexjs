<?php

namespace App\Services\Admin;

use App\Models\AiContentSuggestion;
use App\Models\AiStudioSetting;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AiStudioAdminService
{
    /**
     * Get aggregated metrics for the AI Studio admin dashboard.
     *
     * @param  'today'|'week'|'month'  $period
     * @return array<string,mixed>
     */
    public function getMetrics(string $period = 'today'): array
    {
        $from = match ($period) {
            'week'  => now()->subWeek(),
            'month' => now()->subMonth(),
            default => now()->startOfDay(),
        };

        $base      = AiContentSuggestion::where('created_at', '>=', $from);
        $total     = (clone $base)->count();
        $completed = (clone $base)->where('status', 'completed')->count();
        $failed    = (clone $base)->where('status', 'failed')->count();
        $applied   = (clone $base)->whereNotNull('applied_at')->count();
        $unique    = (clone $base)->distinct('user_id')->count('user_id');

        $tokenStats = DB::table('ai_content_suggestions')
            ->where('created_at', '>=', $from)
            ->whereNotNull('token_usage')
            ->selectRaw("
                SUM((token_usage->>'total_tokens')::int)      AS total_tokens,
                AVG((token_usage->>'total_tokens')::int)      AS avg_tokens,
                SUM((token_usage->>'prompt_tokens')::int)     AS prompt_tokens,
                SUM((token_usage->>'completion_tokens')::int) AS completion_tokens
            ")
            ->first();

        return [
            'period'             => $period,
            'total_requests'     => $total,
            'completed'          => $completed,
            'failed'             => $failed,
            'pending'            => (clone $base)->whereIn('status', ['pending', 'processing'])->count(),
            'success_rate'       => $total > 0 ? round($completed / $total * 100, 1) : 0,
            'apply_rate'         => $completed > 0 ? round($applied / $completed * 100, 1) : 0,
            'unique_users'       => $unique,
            'total_tokens'       => (int) ($tokenStats->total_tokens ?? 0),
            'avg_tokens'         => (int) round((float) ($tokenStats->avg_tokens ?? 0)),
            'prompt_tokens'      => (int) ($tokenStats->prompt_tokens ?? 0),
            'completion_tokens'  => (int) ($tokenStats->completion_tokens ?? 0),
            'estimated_cost_usd' => $this->estimateCost((int) ($tokenStats->total_tokens ?? 0)),
            'intent_breakdown'   => $this->intentBreakdown($from),
            'daily_series'       => $this->dailySeries($from),
        ];
    }

    /**
     * Get the current singleton AI Studio settings.
     */
    public function getSettings(): AiStudioSetting
    {
        return AiStudioSetting::current();
    }

    /**
     * Update the singleton AI Studio settings.
     *
     * @param  array<string,mixed>  $data
     */
    public function updateSettings(array $data, int $adminId): AiStudioSetting
    {
        $settings = AiStudioSetting::current();
        $settings->update(array_merge($data, ['updated_by' => $adminId]));
        Cache::forget('ai_studio_settings');

        return $settings->fresh();
    }

    /**
     * Get paginated list of all AI suggestion requests (admin view).
     *
     * @param  array<string,mixed>  $filters
     */
    public function listRequests(array $filters): LengthAwarePaginator
    {
        return AiContentSuggestion::with('user')
            ->when(
                isset($filters['status']),
                fn ($q) => $q->where('status', $filters['status'])
            )
            ->when(
                isset($filters['user_uuid']),
                fn ($q) => $q->whereHas('user', fn ($uq) => $uq->where('uuid', $filters['user_uuid']))
            )
            ->when(
                isset($filters['date_from']),
                fn ($q) => $q->where('created_at', '>=', $filters['date_from'])
            )
            ->when(
                isset($filters['date_to']),
                fn ($q) => $q->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay())
            )
            ->orderByDesc('created_at')
            ->paginate((int) ($filters['per_page'] ?? 20));
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private function estimateCost(int $totalTokens): float
    {
        // Gemini 1.5 Flash blended rate ~$0.15/1M tokens
        return round($totalTokens / 1_000_000 * 0.15, 6);
    }

    /** @return array<string,int> */
    private function intentBreakdown(Carbon $from): array
    {
        return AiContentSuggestion::where('created_at', '>=', $from)
            ->whereNotNull('content_intent')
            ->groupBy('content_intent')
            ->selectRaw('content_intent, COUNT(*) as count')
            ->pluck('count', 'content_intent')
            ->map(fn ($v) => (int) $v)
            ->toArray();
    }

    /** @return array<int,array<string,mixed>> */
    private function dailySeries(Carbon $from): array
    {
        return AiContentSuggestion::where('created_at', '>=', $from)
            ->selectRaw("
                DATE(created_at) as date,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'failed'    THEN 1 ELSE 0 END) as failed
            ")
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }
}
