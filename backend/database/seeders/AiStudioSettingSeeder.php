<?php

namespace Database\Seeders;

use App\Models\AiStudioSetting;
use Illuminate\Database\Seeder;

class AiStudioSettingSeeder extends Seeder
{
    public function run(): void
    {
        AiStudioSetting::updateOrCreate(
            ['id' => 1],
            [
                'daily_limit_per_user' => 20,
                'global_daily_limit' => 5000,
                'rate_limit_per_minute' => 10,

                'is_enabled' => true,
                'require_min_input' => true,

                'gemini_model' => config('gemini.model', 'gemini-2.0-flash'),
                'max_output_tokens' => 2048,
                'temperature' => 0.7,
                'timeout_seconds' => 30,

                'cache_ttl_hours' => 6,
                'async_mode' => true,

                'copilot_enabled' => true,
                'copilot_session_ttl_hours' => 24,
                'copilot_max_messages_per_session' => 50,

                'feature_flags' => [
                    'streaming'        => true,
                    'frame_analysis'   => true,
                    'timeline_context' => true,
                    'viral_analysis'   => true,
                ],
            ]
        );
    }
}
