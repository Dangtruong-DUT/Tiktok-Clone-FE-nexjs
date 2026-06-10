<?php

namespace App\Repositories;

use App\Models\AiStudioSetting;

/**
 * @extends BaseRepository<AiStudioSetting>
 */
class AiStudioSettingRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(app()->make(AiStudioSetting::class));
    }


    /**
     * Get the current AI Studio settings.
     *
     * @return AiStudioSetting
     */
    public function current(): AiStudioSetting
    {
        $current = $this->query()->first();

        if ($current instanceof AiStudioSetting) {
            return $current;
        }

        return $this->query()->create([
            'daily_limit_per_user' => (int) config('ai_studio.defaults.daily_limit_per_user', 20),
            'global_daily_limit' => (int) config('ai_studio.defaults.global_daily_limit', 5000),
            'rate_limit_per_minute' => (int) config('ai_studio.defaults.rate_limit_per_minute', 10),
            'is_enabled' => (bool) config('ai_studio.defaults.is_enabled', true),
            'require_min_input' => (bool) config('ai_studio.defaults.require_min_input', true),
            'gemini_model' => (string) config('ai_studio.defaults.gemini_model', config('gemini.model', 'gemini-2.0-flash')),
            'max_output_tokens' => (int) config('ai_studio.defaults.max_output_tokens', 2048),
            'temperature' => (float) config('ai_studio.defaults.temperature', 0.7),
            'timeout_seconds' => (int) config('ai_studio.defaults.timeout_seconds', 30),
            'cache_ttl_hours' => (int) config('ai_studio.defaults.cache_ttl_hours', 6),
            'async_mode' => (bool) config('ai_studio.defaults.async_mode', true),
            'feature_flags' => config('ai_studio.defaults.feature_flags', []),
            'copilot_enabled' => (bool) config('ai_studio.defaults.copilot_enabled', true),
            'copilot_session_ttl_hours' => (int) config('ai_studio.defaults.copilot_session_ttl_hours', 24),
            'copilot_max_messages_per_session' => (int) config('ai_studio.defaults.copilot_max_messages_per_session', 50),
            'updated_by' => null,
        ]);
    }
}
