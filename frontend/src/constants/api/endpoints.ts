/** BFF routes — handled by Next.js /api/* handlers (same origin, cookie-based auth). */
export const NEXT_API_ENDPOINT = {
    AUTH: {
        REFRESH_TOKEN: '/api/auth/refresh-token',
        LOGIN:         '/api/auth/login',
        GOOGLE_LOGIN:  '/api/auth/login/google',
        LOGOUT:        '/api/auth/logout',
        REGISTER:      '/api/auth/register',
        VERIFY_EMAIL:  '/api/auth/verify-email'
    },
    WELLNESS: {
        SESSION_END: (uuid: string) => `/api/proxy/wellness/session-end/${uuid}`,
    },
} as const

/** Backend API routes — consumed via httpClient or RTK Query baseQueryWithReauth. */
export const BACKEND_API_ENDPOINT = {
    AUTH: {
        REFRESH_TOKEN: '/auth/refresh-token',
        LOGIN: '/auth/login',
        GOOGLE_LOGIN: '/auth/login/google',
        LOGOUT: '/auth/logout',
        REGISTER: '/auth/register',
        FORGOT_PASSWORD: '/auth/forgot-password',
        VERIFY_EMAIL: '/auth/verify-email',
        RESEND_VERIFY_EMAIL: '/auth/resend-verify-email',
        VERIFY_FORGOT_PASSWORD: '/auth/verify-forgot-password',
        RESET_PASSWORD: '/auth/reset-password'
    },
    USER: {
        ME: '/users/me',
        SETTINGS: '/users/me/settings',
        INDICATORS: '/users/me/indicators',
        CHANGE_PASSWORD: '/users/change-password',
        SUGGESTED: '/users/suggested',
        BY_USERNAME: (username: string) => `/users/${username}`,
        FOLLOWERS: (uuid: string) => `/users/${uuid}/followers`,
        FOLLOWING: (uuid: string) => `/users/${uuid}/following`,
        FRIENDS: (uuid: string) => `/users/${uuid}/friends`,
        FOLLOW: (uuid: string) => `/users/${uuid}/follow`,
        POSTS: (uuid: string) => `/users/${uuid}/posts`,
        BOOKMARKS: (uuid: string) => `/users/${uuid}/bookmark`,
        LIKES: (uuid: string) => `/users/${uuid}/like`
    },
    POST: {
        LIST: '/posts',
        FOLLOWING: '/posts/following',
        FRIEND: '/posts/friend',
        DETAIL: (uuid: string) => `/posts/${uuid}`,
        LIKE: (uuid: string) => `/posts/${uuid}/like`,
        BOOKMARK: (uuid: string) => `/posts/${uuid}/bookmark`,
        CHILDREN: (uuid: string) => `/posts/${uuid}/children`,
        RELATED: (uuid: string) => `/posts/${uuid}/related`
    },
    MEDIA: {
        UPLOAD_IMAGE: '/medias/upload-image',
        UPLOAD_VIDEO: '/medias/upload-video'
    },
    VIDEO: {
        ENCODING_STATUS: (uuid: string) => `/videos/${uuid}/encoding-status`,
        RETRY_ENCODING: (uuid: string) => `/videos/${uuid}/retry-encoding`,
        DELETE: (uuid: string) => `/videos/${uuid}`,
        UPLOAD_SESSION: {
            INIT: '/videos/upload-sessions',
            PART_URL: (sessionUuid: string, partNumber: number) =>
                `/videos/upload-sessions/${sessionUuid}/parts/${partNumber}`,
            COMPLETE: (sessionUuid: string) => `/videos/upload-sessions/${sessionUuid}/complete`,
            STATUS: (sessionUuid: string) => `/videos/upload-sessions/${sessionUuid}/status`,
            ABORT: (sessionUuid: string) => `/videos/upload-sessions/${sessionUuid}`
        }
    },
    NOTIFICATION: {
        LIST: '/notifications',
        UNREAD_COUNT: '/notifications/unread-count',
        MARK_ALL_READ: '/notifications/mark-all-read',
        MARK_READ: (uuid: string) => `/notifications/${uuid}/read`
    },
    SEARCH: {
        POSTS: '/search/posts',
        USERS: '/search/users',
        HASHTAGS: '/search/hashtags'
    },
    APPEAL: {
        LIST: '/appeals',
        RESOURCE_PREVIEW: '/appeals/resource-preview',
        DETAIL: (uuid: string) => `/appeals/${uuid}`
    },
    AI_COPILOT: {
        SESSIONS:       '/studio/ai/copilot/sessions',
        SESSION:        (uuid: string) => `/studio/ai/copilot/sessions/${uuid}`,
        MESSAGES:       (uuid: string) => `/studio/ai/copilot/sessions/${uuid}/messages`,
        STREAM:         (sessionUuid: string, msgUuid: string) =>
                            `/studio/ai/copilot/sessions/${sessionUuid}/stream/${msgUuid}`,
        ACCEPT:         (msgUuid: string) => `/studio/ai/copilot/messages/${msgUuid}/accept`,
        REJECT:         (msgUuid: string) => `/studio/ai/copilot/messages/${msgUuid}/reject`,
        DELETE_SESSION: (uuid: string) => `/studio/ai/copilot/sessions/${uuid}`,
    },

    WELLNESS: {
        STATS:         '/users/me/wellness/stats',
        HISTORY:       '/users/me/wellness/history',
        SESSION_START: '/users/me/wellness/sessions/start',
        HEARTBEAT:     (uuid: string) => `/users/me/wellness/sessions/${uuid}/heartbeat`,
        VIDEO_TIME:    (uuid: string) => `/users/me/wellness/sessions/${uuid}/video-time`,
        SESSION_END:   (uuid: string) => `/users/me/wellness/sessions/${uuid}/end`,
        RULES:         '/users/me/wellness/rules',
        RULE:          (uuid: string) => `/users/me/wellness/rules/${uuid}`,
        PARSE_RULE:    '/users/me/wellness/rules/parse',
        ANALYZE:       '/users/me/wellness/analyze',
    },

    STUDIO_POSTS: {
        LIST:        '/studio/posts',
        SCHEDULED:   '/studio/posts/scheduled',
        SCHEDULE:    (postUuid: string) => `/studio/posts/${postUuid}/schedule`,
        RESCHEDULE:  (schedUuid: string) => `/studio/posts/scheduled/${schedUuid}/reschedule`,
        PUBLISH_NOW: (postUuid: string) => `/studio/posts/${postUuid}/publish-now`,
        CANCEL:      (schedUuid: string) => `/studio/posts/scheduled/${schedUuid}/cancel`,
    },
    ADMIN: {
        AI_STUDIO: {
            METRICS:  '/admin/ai-studio/metrics',
            SETTINGS: '/admin/ai-studio/settings',
            REQUESTS: '/admin/ai-studio/requests',
            MODELS:   '/admin/ai-studio/models',
            // AI Copilot admin
            COPILOT_METRICS:   '/admin/ai-studio/copilot/metrics',
            COPILOT_SESSIONS:  '/admin/ai-studio/copilot/sessions',
            PROMPT_TEMPLATES:     '/admin/ai-studio/prompt-templates',
            PROMPT_TEMPLATE:      (intent: string) => `/admin/ai-studio/prompt-templates/${intent}`,
            LOCK_TEMPLATE:        (intent: string) => `/admin/ai-studio/prompt-templates/${intent}/lock`,
            UNLOCK_TEMPLATE:      (intent: string) => `/admin/ai-studio/prompt-templates/${intent}/unlock`,
            FEATURE_FLAGS:        '/admin/ai-studio/feature-flags',
        },
        AI_KNOWLEDGE: {
            DOCUMENTS: '/admin/ai-studio/knowledge/documents',
            DOCUMENT:  (id: number) => `/admin/ai-studio/knowledge/documents/${id}`,
            UPLOAD:    '/admin/ai-studio/knowledge/documents/upload',
        },
        SCHEDULED_POSTS: {
            METRICS:      '/admin/scheduled-posts/metrics',
            REQUESTS:     '/admin/scheduled-posts/requests',
            CANCEL:       (uuid: string) => `/admin/scheduled-posts/${uuid}/cancel`,
            RETRY:        (uuid: string) => `/admin/scheduled-posts/${uuid}/retry`,
        },
    }
} as const
