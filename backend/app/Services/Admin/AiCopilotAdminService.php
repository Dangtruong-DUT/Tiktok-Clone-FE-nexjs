<?php

namespace App\Services\Admin;

use App\Models\AiPromptTemplate;
use App\Models\AiStudioSetting;
use App\Repositories\AiStudioSettingRepository;
use App\Repositories\AiCopilotSessionRepository;
use App\Repositories\AiPromptTemplateRepository;
use App\Repositories\AiUsageLogRepository;

class AiCopilotAdminService
{
    /**
     * Create a new service instance.
     *
     * @param  AiUsageLogRepository  $usageRepo
     * @param  AiCopilotSessionRepository  $sessionRepo
     * @param  AiPromptTemplateRepository  $templateRepo
     */
    public function __construct(
        private readonly AiUsageLogRepository       $usageRepo,
        private readonly AiCopilotSessionRepository $sessionRepo,
        private readonly AiPromptTemplateRepository $templateRepo,
        private readonly AiStudioSettingRepository  $settingRepository,
    ) {}

    /**
     * Get aggregated copilot metrics for the requested period.
     *
     * @param  string|null  $period
     * @return array<string,mixed>
     */
    public function getCopilotMetrics(?string $period = null): array
    {
        $period ??= 'today';

        return [
            'period'       => $period,
            'by_intent'    => $this->usageRepo->metricsByPeriod($period),
            'daily_series' => $this->usageRepo->dailySeries(30),
            'top_users'    => $this->usageRepo->topUsersByUsage(10),
        ];
    }

    /**
     * Retrieve all active copilot prompt templates.
     *
     * @return \Illuminate\Database\Eloquent\Collection<int,AiPromptTemplate>
     */
    public function getPromptTemplates(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->templateRepo->allActive();
    }

    /**
     * Update a prompt template by intent.
     *
     * @param  string  $intent
     * @param  array<string,mixed>  $data
     * @param  int  $adminId
     * @return AiPromptTemplate
     */
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

    /**
     * Update AI Studio feature flags.
     *
     * @param  array<string,mixed>  $flags
     * @param  int  $adminId
     * @return AiStudioSetting
     */
    public function updateFeatureFlags(array $flags, int $adminId): AiStudioSetting
    {
        $setting = $this->settingRepository->current();
        $merged  = array_merge($setting->feature_flags ?? [], $flags);

        $setting->update([
            'feature_flags' => $merged,
            'updated_by'    => $adminId,
        ]);

        return $setting->fresh();
    }

    /**
     * Get paginated copilot sessions for the admin area.
     *
     * @param  array<string,mixed>  $filters
     * @return \Illuminate\Pagination\LengthAwarePaginator<int,\App\Models\AiCopilotSession>
     */
    public function getSessions(array $filters = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        return $this->sessionRepo->paginateForAdmin((int) ($filters['per_page'] ?? 20));
    }

    /**
     * Lock a prompt template to prevent edits.
     *
     * @param  string  $intent
     * @return AiPromptTemplate
     */
    public function lockTemplate(string $intent): AiPromptTemplate
    {
        return $this->templateRepo->setLockedByIntent($intent, true);
    }

    /**
     * Unlock a prompt template to allow edits.
     *
     * @param  string  $intent
     * @return AiPromptTemplate
     */
    public function unlockTemplate(string $intent): AiPromptTemplate
    {
        return $this->templateRepo->setLockedByIntent($intent, false);
    }
}
