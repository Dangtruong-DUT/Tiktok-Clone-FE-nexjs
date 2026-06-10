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
            'daily_limit_per_user'          => 20,
            'global_daily_limit'            => 5000,
            'rate_limit_per_minute'         => 10,
            'is_enabled'                    => true,
            'require_min_input'             => true,
            'gemini_model'                  => config('gemini.model', 'gemini-2.0-flash'),
            'max_output_tokens'             => 2048,
            'temperature'                   => 0.7,
            'timeout_seconds'               => 30,
            'cache_ttl_hours'               => 6,
            'async_mode'                    => true,
            'feature_flags'                 => [
                'streaming'        => true,
                'frame_analysis'   => true,
                'timeline_context' => true,
                'viral_analysis'   => true,
            ],
            'copilot_enabled'               => true,
            'copilot_session_ttl_hours'     => 24,
            'copilot_max_messages_per_session' => 50,
            'updated_by'                    => null,
        ]);
    }
}
