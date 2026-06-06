<?php

namespace App\Services\Admin;

use App\Models\AiPromptTemplate;
use App\Models\AiStudioSetting;
use App\Repositories\AiCopilotSessionRepository;
use App\Repositories\AiPromptTemplateRepository;
use App\Repositories\AiUsageLogRepository;

class AiCopilotAdminService
{
    public function __construct(
        private readonly AiUsageLogRepository       $usageRepo,
        private readonly AiCopilotSessionRepository $sessionRepo,
        private readonly AiPromptTemplateRepository $templateRepo,
    ) {}

    public function getCopilotMetrics(string $period = 'today'): array
    {
        return [
            'period'       => $period,
            'by_intent'    => $this->usageRepo->metricsByPeriod($period),
            'daily_series' => $this->usageRepo->dailySeries(30),
            'top_users'    => $this->usageRepo->topUsersByUsage(10),
        ];
    }

    /** @return array<string, mixed> */
    public function getPromptTemplates(): array
    {
        return $this->templateRepo->allActive()->toArray();
    }

    public function updatePromptTemplate(string $intent, array $data, int $adminId): AiPromptTemplate
    {
        $template = $this->templateRepo->findByIntentAny($intent);

        if ($template?->is_locked) {
            abort(422, 'This prompt template is locked and cannot be edited. Unlock it first.');
        }

        $allowed = array_intersect_key($data, array_flip([
            'display_name', 'system_prompt', 'user_template', 'few_shot_examples', 'is_active',
        ]));

        return $this->templateRepo->updateByIntent($intent, $allowed, $adminId);
    }

    public function updateFeatureFlags(array $flags, int $adminId): AiStudioSetting
    {
        $setting = AiStudioSetting::current();
        $merged  = array_merge($setting->feature_flags ?? [], $flags);

        $setting->update([
            'feature_flags' => $merged,
            'updated_by'    => $adminId,
        ]);

        return $setting->fresh();
    }

    public function getSessions(int $perPage = 20): \Illuminate\Pagination\LengthAwarePaginator
    {
        return \App\Models\AiCopilotSession::with('user:id,uuid,username')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
