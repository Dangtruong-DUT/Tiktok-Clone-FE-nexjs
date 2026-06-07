<?php

return [
    'logging' => [
        'channel'          => env('AI_LOG_CHANNEL', 'ai'),
        'log_raw_response' => (bool) env('AI_LOG_RAW_RESPONSE', false),
    ],

    'copilot' => [
        'intent' => [
            'min_confidence'    => (float) env('AI_COPILOT_INTENT_MIN_CONFIDENCE', 0.40),
            'temperature'       => (float) env('AI_COPILOT_INTENT_TEMPERATURE', 0.1),
            'max_output_tokens' => (int)   env('AI_COPILOT_INTENT_MAX_TOKENS', 150),
        ],
    ],

    'rag' => [
        'chunk_target_chars'  => (int) env('AI_RAG_CHUNK_TARGET_CHARS', 3000),
        'chunk_overlap_chars' => (int) env('AI_RAG_CHUNK_OVERLAP_CHARS', 400),
    ],
];