<?php

return [
    'api_key'           => env('GEMINI_API_KEY'),
    'model'             => env('GEMINI_MODEL', 'gemini-2.0-flash'),
    'base_url'          => env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
    'request_timeout'   => (int)   env('GEMINI_TIMEOUT', 30),
    'available_models'  => [
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.5-pro',
        'gemini-2.0-flash',
    ],

    'retry' => [
        'max_retries'    => (int) env('GEMINI_MAX_RETRIES', 2),
        'retry_delay_ms' => (int) env('GEMINI_RETRY_DELAY_MS', 1000),
    ],

    'embedding' => [
        'model'   => env('GEMINI_EMBEDDING_MODEL', 'text-embedding-004'),
        'timeout' => (int) env('GEMINI_EMBEDDING_TIMEOUT', 30),
    ],
];
