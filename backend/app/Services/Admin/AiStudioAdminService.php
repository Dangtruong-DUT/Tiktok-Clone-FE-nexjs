<?php

namespace App\Services\Admin;

use App\Models\AiStudioSetting;
use App\Models\AiUsageLog;
use App\Repositories\AiStudioSettingRepository;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class AiStudioAdminService
{
    /**
     * Create a new service instance.
     */
    public function __construct(
        private readonly AiStudioSettingRepository $settingRepository,
    ) {}

    /**
     * Get aggregated copilot usage metrics for the admin dashboard.
     *
     * @param  string|null  $period
     * @return array<string,mixed>
     */
    public function getMetrics(?string $period = null): array
    {
        $period ??= 'today';

        $from = match ($period) {
            'week'  => now()->subWeek(),
            'month' => now()->subMonth(),
            default => now()->startOfDay(),
        };

        $base = AiUsageLog::where('created_at', '>=', $from);

        $total       = (clone $base)->count();
        $failed      = (clone $base)->where('status', 'failed')->count();
        $completed   = $total - $failed;
        $unique      = (clone $base)->distinct('user_id')->count('user_id');
        $totalTokens = (clone $base)->sum('total_tokens');
        $totalCost   = (clone $base)->sum('cost_usd');

        return [
            'period'             => $period,
            'total_requests'     => $total,
            'completed'          => $completed,
            'failed'             => $failed,
            'success_rate'       => $total > 0 ? round($completed / $total * 100, 1) : 0,
            'unique_users'       => $unique,
            'total_tokens'       => (int) $totalTokens,
            'total_cost_usd'     => round((float) $totalCost, 4),
            'intent_breakdown'   => $this->intentBreakdown($from),
            'daily_series'       => $this->dailySeries($from),
        ];
    }

    /**
     * Get the current singleton AI Studio settings.
     *
     * @return AiStudioSetting
     */
    public function getSettings(): AiStudioSetting
    {
        return $this->settingRepository->current();
    }

    /**
     * Get the list of configurable Gemini models.
     *
     * @return string[]
     */
    public function getAvailableModels(): array
    {
        return config('gemini.available_models', []);
    }

    /**
     * Update the singleton AI Studio settings.
     *
     * @param  array<string,mixed>  $data
     * @param  int  $adminId
     * @return AiStudioSetting
     */
    public function updateSettings(array $data, int $adminId): AiStudioSetting
    {
        $settings = $this->settingRepository->current();
        $settings->update(array_merge($data, ['updated_by' => $adminId]));
        Cache::forget('ai_studio_settings');

        return $settings->fresh();
    }

    /**
     * Get paginated list of copilot usage logs (admin view).
     *
     * @param  array<string,mixed>  $filters
     * @return LengthAwarePaginator<int,AiUsageLog>
     */
    public function listRequests(array $filters): LengthAwarePaginator
    {
        $filters = array_filter(
            $filters,
            static fn ($value) => $value !== null && $value !== ''
        );

        return AiUsageLog::with(['user:id,uuid,username,avatar_file_id', 'user.avatarFile'])
            ->when(
                isset($filters['intent']),
                fn ($q) => $q->where('intent', $filters['intent'])
            )
            ->when(
                isset($filters['status']),
                fn ($q) => $q->where('status', $filters['status'])
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


    /** @return array<string,int> */
    private function intentBreakdown(Carbon $from): array
    {
        return AiUsageLog::where('created_at', '>=', $from)
            ->whereNotNull('intent')
            ->groupBy('intent')
            ->selectRaw('intent, COUNT(*) as count')
            ->pluck('count', 'intent')
            ->map(fn ($v) => (int) $v)
            ->toArray();
    }

    /** @return array<int,array<string,mixed>> */
    private function dailySeries(Carbon $from): array
    {
        return AiUsageLog::where('created_at', '>=', $from)
            ->selectRaw("
                DATE(created_at) as date,
                COUNT(*) as total,
                SUM(total_tokens) as tokens,
                SUM(cost_usd) as cost
            ")
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get()
            ->toArray();
    }
}
