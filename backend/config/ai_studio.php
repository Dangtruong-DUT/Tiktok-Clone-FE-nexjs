<?php

return [
    'defaults' => [
        'daily_limit_per_user' => (int) env('AI_STUDIO_DAILY_LIMIT_PER_USER', 20),
        'global_daily_limit' => (int) env('AI_STUDIO_GLOBAL_DAILY_LIMIT', 5000),
        'rate_limit_per_minute' => (int) env('AI_STUDIO_RATE_LIMIT_PER_MINUTE', 10),

        'is_enabled' => (bool) env('AI_STUDIO_IS_ENABLED', true),
        'require_min_input' => (bool) env('AI_STUDIO_REQUIRE_MIN_INPUT', true),

        'gemini_model' => env('AI_STUDIO_GEMINI_MODEL', config('gemini.model', 'gemini-2.0-flash')),
        'max_output_tokens' => (int) env('AI_STUDIO_MAX_OUTPUT_TOKENS', 2048),
        'temperature' => (float) env('AI_STUDIO_TEMPERATURE', 0.7),
        'timeout_seconds' => (int) env('AI_STUDIO_TIMEOUT_SECONDS', 30),

        'cache_ttl_hours' => (int) env('AI_STUDIO_CACHE_TTL_HOURS', 6),
        'async_mode' => (bool) env('AI_STUDIO_ASYNC_MODE', true),

        'copilot_enabled' => (bool) env('AI_STUDIO_COPILOT_ENABLED', true),
        'copilot_session_ttl_hours' => (int) env('AI_STUDIO_COPILOT_SESSION_TTL_HOURS', 24),
        'copilot_max_messages_per_session' => (int) env('AI_STUDIO_COPILOT_MAX_MESSAGES_PER_SESSION', 50),

        'feature_flags' => [
            'streaming' => (bool) env('AI_STUDIO_FEATURE_STREAMING', true),
            'frame_analysis' => (bool) env('AI_STUDIO_FEATURE_FRAME_ANALYSIS', true),
            'timeline_context' => (bool) env('AI_STUDIO_FEATURE_TIMELINE_CONTEXT', true),
            'viral_analysis' => (bool) env('AI_STUDIO_FEATURE_VIRAL_ANALYSIS', true),
        ],
    ],
];
