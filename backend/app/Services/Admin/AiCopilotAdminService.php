<?php

namespace App\Services\Admin;

use App\Models\AiPromptTemplate;
use App\Models\AiStudioSetting;
use App\Repositories\AiCopilotSessionRepository;
use App\Repositories\AiUsageLogRepository;

class AiCopilotAdminService
{
    public function __construct(
        private readonly AiUsageLogRepository        $usageRepo,
        private readonly AiCopilotSessionRepository  $sessionRepo,
    ) {}

    public function getCopilotMetrics(string $period = 'today'): array
    {
        return [
            'period'        => $period,
            'by_intent'     => $this->usageRepo->metricsByPeriod($period),
            'daily_series'  => $this->usageRepo->dailySeries(30),
            'top_users'     => $this->usageRepo->topUsersByUsage(10),
        ];
    }

    /** @return array<string, mixed> */
    public function getPromptTemplates(): array
    {
        return AiPromptTemplate::orderBy('intent')->get()->toArray();
    }

    public function updatePromptTemplate(string $intent, array $data, int $adminId): AiPromptTemplate
    {
        $template = AiPromptTemplate::where('intent', $intent)->firstOrFail();

        $allowed = array_intersect_key($data, array_flip([
            'display_name', 'system_prompt', 'user_template', 'few_shot_examples', 'is_active',
        ]));

        $template->fill($allowed);
        $template->updated_by = $adminId;
        $template->version++;
        $template->save();

        return $template;
    }

    public function updateFeatureFlags(array $flags, int $adminId): AiStudioSetting
    {
        $setting = AiStudioSetting::current();

        $current = $setting->feature_flags ?? [];
        $merged  = array_merge($current, $flags);

        $setting->feature_flags = $merged;
        $setting->updated_by    = $adminId;
        $setting->save();

        return $setting;
    }

    public function getSessions(int $perPage = 20): \Illuminate\Pagination\LengthAwarePaginator
    {
        return \App\Models\AiCopilotSession::with('user:id,uuid,username')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
