<?php

return [
    'provider'       => env('AI_PROVIDER', 'gemini'),
    'prompt_version' => env('AI_CONTENT_STUDIO_PROMPT_VERSION', 'v1'),

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