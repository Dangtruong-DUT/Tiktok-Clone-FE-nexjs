<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'ai_moderation' => [
        'enabled' => (bool) env('AI_MODERATION_ENABLED', true),
        'appeal_window_days' => (int) env('AI_MODERATION_APPEAL_WINDOW_DAYS', 7),
        'kafka' => [
            'bootstrap_servers' => env('AI_MODERATION_KAFKA_BOOTSTRAP_SERVERS', 'kafka:29092'),
            'request_topic' => env('AI_MODERATION_KAFKA_REQUEST_TOPIC', 'moderation.request.v1'),
            'result_topic' => env('AI_MODERATION_KAFKA_RESULT_TOPIC', 'moderation.result.v1'),
            'result_group_id' => env('AI_MODERATION_KAFKA_RESULT_GROUP_ID', 'snapi-ai-moderation-result-consumer'),
        ],
    ],

];
