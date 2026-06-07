<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Intent keyword rules (English)
    |--------------------------------------------------------------------------
    | Used by AiCopilotIntentDetector::detectByKeyword() to match user messages.
    | Add new keywords here — no code changes required.
    */
    'intent_keywords' => [
        'query_user_stats' => [
            'my account', 'my stats', 'my profile', 'account info', 'account stats',
            'how many followers', 'my followers', 'my following',
            'my total views', 'my total likes', 'show my profile',
            'my appeal', 'appeal status', 'my appeals',
            'who am i', 'my username', 'my email', 'my avatar',
            'my post count', 'total posts', 'scheduled posts count',
        ],
        'admin_query_appeals' => [
            'pending appeals', 'appeal list', 'show appeals', 'review appeals',
        ],
        'admin_query_ai_metrics' => [
            'ai costs today', 'ai costs', 'ai spending', 'ai usage',
            'how many tokens', 'token usage', 'tokens used', 'ai bill',
            'ai metrics detail', 'ai usage detail', 'copilot usage',
            'top intent', 'top user ai',
        ],
        'admin_query_encoding' => [
            'encoding errors', 'encoding queue', 'encoding failures',
            'encoding status', 'video encoding errors',
        ],
        'admin_query_stats' => [
            'system stats', 'admin stats', 'platform stats',
            'total users', 'how many users', 'new users today',
            'total posts on platform', 'platform metrics',
            'system report', 'platform report', 'dashboard stats',
            'active users', 'sign ups today', 'overall stats',
            'system user stats',
        ],
        'query_post_stats' => [
            'my posts', 'my videos', 'how many posts', 'post count',
            'my recent posts', 'post stats', 'post performance',
            'best performing post', 'most viewed post', 'failed posts',
            'draft posts', 'pending posts', 'post status',
            'today posts', 'scheduled posts', 'my content',
            'show my posts', 'list my videos',
        ],
        'query_notifications' => [
            'notification', 'notifications today', 'unread notifications',
            'notifications', 'unread',
        ],
        'query_screen_time' => [
            'screen time', 'watch history', 'time spent', 'usage time',
            'my screen time', 'my usage stats', 'how long have i been',
            'wellness stats',
        ],
        'schedule_post' => [
            'schedule post', 'when to post', 'best time to post',
            'post tomorrow', 'post next week', 'set schedule',
            'post at what time', 'optimal posting time',
            'schedule for later', 'plan my post',
        ],
        'write_caption' => [
            'write caption', 'create caption', 'caption ideas',
            'write post content', 'write post', 'help me write',
            'content for my video', 'suggest a caption',
            'write my post', 'post text',
        ],
        'write_title' => [
            'write title', 'video title', 'title ideas',
        ],
        'write_description' => [
            'describe', 'write description', 'write a description',
        ],
        'generate_hashtags' => [
            'hashtags', 'tags', 'create hashtags',
            'suggest hashtags', 'which hashtags to use',
            'trending tags', 'relevant hashtags',
            'popular hashtags', 'add hashtags',
        ],
        'rewrite_content' => [
            'rewrite', 'make it better', 'improve',
            'enhance this', 'optimize content', 'revise',
            'edit my post', 'rework this', 'fix my content', 'upgrade',
        ],
        'analyze_video' => [
            'analyze this video', 'review my video', 'evaluate video',
            'is this video good', 'should i post this',
            'video quality', 'check my video', 'rate my video',
            'give feedback on video', 'critique my video',
        ],
        'analyze_viral' => [
            'can this go viral', 'trending potential', 'viral potential',
            'will this trend', 'virality score', 'viral assessment',
            'is this trending', 'will people share this',
        ],
        'analyze_hook' => [
            'hook quality', 'opening seconds', 'first 3 seconds',
            'intro analysis', 'opening hook', 'is hook good',
            'analyze intro', 'video start',
        ],
        'analyze_retention' => [
            'retention rate', 'do viewers watch to the end',
            'drop off point', 'audience retention', 'viewer engagement',
        ],
        'suggest_cta' => [
            'write cta', 'suggest cta', 'create cta', 'generate cta',
            'call to action ideas', 'write a call to action', 'cta suggestions',
        ],
        'analyze_cta' => [
            'analyze cta', 'evaluate cta', 'cta effectiveness',
            'call to action analysis', 'is my cta good', 'review my cta',
        ],
        'analyze_audience' => [
            'audience', 'target', 'demographics',
        ],
        'navigate_to' => [
            'navigate to', 'go to', 'take me to', 'open page',
            'where is', 'how to get to', 'link to',
            'find the page', 'go to settings', 'open dashboard',
        ],
        'query_app_info' => [
            'how to use snapi', 'what is snapi', 'snapi features',
            'how does snapi work', 'what can snapi do', 'snapi app features',
            'community guidelines', 'terms of service', 'policy',
            'what is ai copilot', 'what is wellness', 'studio features',
            'getting started with snapi', 'learn about snapi',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Follow-up chips (English)
    |--------------------------------------------------------------------------
    */
    'chips' => [
        'write_caption'    => ['Make it shorter', 'Generate hashtags', 'Analyze viral potential', 'Suggest CTA'],
        'generate_hashtags' => ['Write a caption', 'Analyze viral potential', 'Suggest CTA'],
        'analyze_viral'    => ['How to improve?', 'Write a better caption', 'Suggest CTA', 'Analyze hook'],
        'analyze_video'    => ['Analyze the hook', 'Write a caption', 'Generate hashtags', 'Analyze viral potential'],
        'schedule_post'    => ['Write a caption', 'Generate hashtags', 'Analyze viral potential'],
        'error'            => ['Try again', 'Ask something else'],
        'default'          => ['Write a caption', 'Generate hashtags', 'Analyze viral potential', 'Analyze hook'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Admin-only intents
    |--------------------------------------------------------------------------
    */
    'admin_only_intents' => [
        'admin_query_stats',
        'admin_query_appeals',
        'admin_query_ai_metrics',
        'admin_query_encoding',
    ],

];
