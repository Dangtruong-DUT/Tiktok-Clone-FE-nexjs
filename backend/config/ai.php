<?php

return [
    'provider'       => env('AI_PROVIDER', 'gemini'),
    'prompt_version' => env('AI_CONTENT_STUDIO_PROMPT_VERSION', 'v1'),

    'gemini' => [
        'api_key'    => env('GEMINI_API_KEY'),
        'model'      => env('GEMINI_MODEL', 'gemini-2.0-flash'),
        'base_url'   => env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
        'timeout'    => (int) env('GEMINI_TIMEOUT', 30),
        'temperature' => (float) env('GEMINI_TEMPERATURE', 0.7),
        'max_tokens' => (int) env('GEMINI_MAX_OUTPUT_TOKENS', 2048),
    ],

    'content_studio' => [
        'cache_ttl_seconds' => (int) env('AI_CONTENT_STUDIO_CACHE_TTL', 21600),
        'lock_ttl_seconds'  => (int) env('AI_CONTENT_STUDIO_LOCK_TTL', 60),
        'max_input_length'  => (int) env('AI_CONTENT_STUDIO_MAX_INPUT_LENGTH', 3000),
        'queue'             => env('AI_CONTENT_STUDIO_QUEUE', 'ai-content'),
        'async'             => (bool) env('AI_CONTENT_STUDIO_ASYNC', true),
    ],

    'logging' => [
        'channel'          => env('AI_LOG_CHANNEL', 'ai'),
        'log_raw_response' => (bool) env('AI_LOG_RAW_RESPONSE', false),
    ],
];
