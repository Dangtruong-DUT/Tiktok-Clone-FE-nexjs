<?php

return [
    'api_key'          => env('GEMINI_API_KEY', ''),
    'model'            => env('GEMINI_MODEL', 'gemini-2.0-flash'),
    'base_url'         => env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
    'request_timeout'  => (int)   env('GEMINI_TIMEOUT', 30),
    'temperature'      => (float) env('GEMINI_TEMPERATURE', 0.7),
    'max_output_tokens' => (int)  env('GEMINI_MAX_OUTPUT_TOKENS', 2048),
    'available_models' => [
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.5-pro',
        'gemini-2.0-flash',
    ],
];