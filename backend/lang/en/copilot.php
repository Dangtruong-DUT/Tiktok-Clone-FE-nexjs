<?php

return [

    'large_video_notice' => 'Your video is quite large. For a better analysis, describe what the video is about or choose the segment you want to focus on.',

    'routes' => [
        'upload' => [
            'label'       => 'Upload new video',
            'description' => 'Upload and edit your next video',
        ],
        'scheduled_posts' => [
            'label'       => 'Scheduled posts',
            'description' => 'View and manage scheduled posts',
        ],
        'content' => [
            'label'       => 'Content manager',
            'description' => 'View all of your posts',
        ],
        'wellness' => [
            'label'       => 'Wellness & Screen Time',
            'description' => 'Track usage time and set healthy limits',
        ],
        'settings' => [
            'label'       => 'Account settings',
            'description' => 'Edit profile, password, and security preferences',
        ],
        'appeals' => [
            'label'       => 'Moderation appeals',
            'description' => 'Submit and track moderation appeals',
        ],
        'admin' => [
            'label'       => 'Admin Dashboard',
            'description' => 'Open the system administration dashboard',
        ],
        'home' => [
            'label'       => 'Snapi Studio overview',
            'description' => 'Open your Snapi Studio dashboard',
        ],
    ],

    'messages' => [
        'clarification' => 'I am not fully sure what you need. Do you want to create content, view statistics, ask for guidance, or analyze a video?',
        'navigation_all' => 'Here are all available Snapi Studio pages:',
        'navigation_matched' => 'I found a page that matches your request:',
        'analytics_clarification' => 'Which statistics would you like to see? For example: posts, users, AI, appeals, or system health.',
        'analytics_empty' => 'I could not find matching data for that request. Could you ask a bit more specifically?',
        'app_knowledge_fallback' => <<<'MD'
## Snapi Studio — Feature Guide

Snapi Studio is a short-form video creation platform.

### Key Features
- **Upload video**: Upload, edit thumbnail, captions, hashtags, schedule, or publish immediately
- **AI Copilot**: Write captions and hashtags, analyze viral potential, hooks, and retention
- **Analytics**: View views, likes, followers, and screen time
- **Wellness**: Track and limit usage time
- **Appeals**: Submit moderation decision appeals

Ask me about any feature for more details!
MD,
    ],

    'errors' => [
        'rate_limited'      => 'AI is handling many requests right now. Please try again in a few seconds.',
        'overloaded'        => 'AI is currently overloaded. Please try again shortly.',
        'invalid_config'    => 'AI configuration is invalid. Please check the API key in settings.',
        'permission_denied' => 'The API key does not have access to this model.',
        'generic'           => 'Something went wrong while connecting to AI. Please try again.',
    ],

    'labels' => [
        'suggestion' => 'Suggestion',
    ],

    'admin_live_context' => [
        'heading'          => 'System status (live)',
        'pending_appeals'  => 'Pending appeals',
        'failed_encodings' => 'Failed video encodings',
        'active_queue'     => 'Videos currently in queue',
    ],

    /*
    |--------------------------------------------------------------------------
    | Follow-up chips (English)
    |--------------------------------------------------------------------------
    */
    'chips' => [
        // Default chips by role/surface — shown when engine returns no specific chips
        'admin_default'       => ['User statistics', 'System health', 'Pending appeals', 'AI costs'],
        'admin_navigation'    => ['User management', 'Pending appeals', 'Admin audit logs', 'System health'],
        'admin_app_knowledge' => ['System statistics', 'Pending appeals', 'AI costs', 'Top creators'],
        'creator_default'     => ['View post statistics', 'My follower growth', 'Wellness & Screen time', 'Upload new video'],

        'write_caption'    => ['Make it shorter', 'Generate hashtags', 'Analyze viral potential', 'Suggest CTA'],
        'write_title'      => ['Write a caption', 'Generate hashtags', 'Write description'],
        'write_description' => ['Write a caption', 'Generate hashtags', 'Shorten description'],
        'rewrite_content'  => ['Make it shorter', 'Make it more engaging', 'Add CTA'],
        'suggest_cta'      => ['Write a caption', 'Generate hashtags', 'Analyze CTA'],
        'content_generation' => ['Write a caption', 'Generate hashtags', 'Analyze viral potential'],
        'generate_hashtags' => ['Write a caption', 'Analyze viral potential', 'Suggest CTA'],
        'analyze_viral'    => ['How to improve?', 'Write a better caption', 'Suggest CTA', 'Analyze hook'],
        'analyze_video'    => ['Analyze the hook', 'Write a caption', 'Generate hashtags', 'Analyze viral potential'],
        'analyze_hook'     => ['Rewrite hook', 'Analyze retention', 'Write caption'],
        'analyze_retention' => ['Improve hook', 'Analyze viral potential', 'Suggest CTA'],
        'analyze_cta'      => ['Write new CTA', 'Write caption', 'Analyze viral potential'],
        'analyze_audience' => ['Suggest caption', 'Analyze viral potential', 'Generate hashtags'],
        'analyze_frame'    => ['Analyze full video', 'Write caption', 'Suggest thumbnail'],
        'analyze_video_segment' => ['Analyze full video', 'Write caption for segment', 'Analyze viral potential'],
        'video_review'     => ['Analyze hook', 'Analyze viral potential', 'Write caption'],
        'analytics'        => ['View other statistics', 'Compare previous period', 'More detailed analysis'],
        'analytics_post'   => ['Compare previous period', 'View engagement details', 'User statistics'],
        'analytics_user_growth' => ['Post statistics', 'Compare last month', 'Top creators'],
        'analytics_post_engagement' => ['Compare previous period', 'Top videos', 'Post overview'],
        'analytics_follower_growth' => ['Post statistics', 'My top videos', 'Compare last month'],
        'analytics_screen_time'     => ['Set usage limit', 'Compare last week', 'Post statistics'],
        'analytics_top_videos'      => ['View engagement details', 'Post statistics', 'Compare previous period'],
        'analytics_comments'        => ['Post statistics', 'Engagement details', 'Compare previous period'],
        'analytics_ai_studio'       => ['Daily usage trend', 'Compare last month', 'Cost by intent'],
        'analytics_scheduled'       => ['Schedule new post', 'Post statistics', 'Compare previous period'],
        'analytics_active_users'    => ['New user stats', 'Compare last week', 'Top creators'],
        'analytics_appeals'         => ['Appeal SLA metrics', 'By appeal type', 'Compare previous period'],
        'analytics_ai_copilot'      => ['AI studio costs', 'Top intents', 'Compare last month'],
        'analytics_top_creators'    => ['User statistics', 'Platform top videos', 'User growth'],
        'analytics_audit'           => ['Recent actions', 'Top admins', 'Compare previous period'],
        'analytics_system_health'   => ['Encoding queue status', 'Pending appeals', 'AI costs'],
        'analytics_encoding'        => ['Failed job details', 'System health overview', 'Compare yesterday'],
        'analytics_clarification' => ['Post statistics', 'User statistics', 'AI cost', 'System statistics'],
        'analytics_empty'  => ['Post statistics', 'User statistics', 'System statistics'],
        'navigation'       => ['Upload new video', 'View my posts', 'Account settings'],
        'app_knowledge'    => ['How to upload video', 'What can AI Copilot do?', 'Go to settings'],
        'large_video_notice' => ['Describe my video', 'Select a segment', 'Analyze the hook'],
        'clarification'    => ['Write caption', 'View statistics', 'Ask guide', 'Analyze video'],
        'schedule_post'    => ['Write a caption', 'Generate hashtags', 'Analyze viral potential'],
        'error'            => ['Try again', 'Ask something else'],
        'default'          => ['Write a caption', 'Generate hashtags', 'Analyze viral potential', 'Analyze hook'],
    ],

];
