/** BFF routes — handled by Next.js /api/* handlers (same origin, cookie-based auth). */
export const NEXT_API_ENDPOINT = {
    AUTH: {
        REFRESH_TOKEN: '/api/auth/refresh-token',
        LOGIN: '/api/auth/login',
        GOOGLE_LOGIN: '/api/auth/login/google',
        LOGOUT: '/api/auth/logout',
        REGISTER: '/api/auth/register',
        VERIFY_EMAIL: '/api/auth/verify-email'
    }
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
    AI_STUDIO: {
        GENERATE: '/studio/ai/content-suggestions',
        LIST: '/studio/ai/content-suggestions',
        BY_UUID: (uuid: string) => `/studio/ai/content-suggestions/${uuid}`,
        APPLY: (uuid: string) => `/studio/ai/content-suggestions/${uuid}/apply`,

        CREATOR_CHAT: {
            START:    '/studio/ai/creator-chat/start',
            BY_UUID:  (uuid: string) => `/studio/ai/creator-chat/${uuid}`,
            ANSWER:   (uuid: string) => `/studio/ai/creator-chat/${uuid}/answer`,
            SKIP:     (uuid: string) => `/studio/ai/creator-chat/${uuid}/skip`,
            GENERATE: (uuid: string) => `/studio/ai/creator-chat/${uuid}/generate`,
        },

        VIRAL_SCORE: {
            ANALYZE: '/studio/ai/viral-score/analyze',
            BY_UUID: (uuid: string) => `/studio/ai/viral-score/${uuid}`,
        },

        CALENDAR: {
            GENERATE:     '/studio/ai/content-calendar/generate',
            LIST:         '/studio/ai/content-calendar',
            BY_UUID:      (uuid: string) => `/studio/ai/content-calendar/${uuid}`,
            CREATE_DRAFT: (itemUuid: string) => `/studio/ai/content-calendar/items/${itemUuid}/create-draft`,
            SCHEDULE:     (itemUuid: string) => `/studio/ai/content-calendar/items/${itemUuid}/schedule`,
        },
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
        },
        SCHEDULED_POSTS: {
            METRICS:      '/admin/scheduled-posts/metrics',
            REQUESTS:     '/admin/scheduled-posts/requests',
            CANCEL:       (uuid: string) => `/admin/scheduled-posts/${uuid}/cancel`,
            RETRY:        (uuid: string) => `/admin/scheduled-posts/${uuid}/retry`,
        },
    }
} as const
