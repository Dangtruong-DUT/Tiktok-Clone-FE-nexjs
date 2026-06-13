export const APP_ROUTES = {
    HOME: '/',
    SEARCH: '/search',
    UPLOAD: '/upload',
    EXPLORE: '/explore',
    MESSAGES: '/messages',
    ACTIVITY: '/activity',
    FRIENDS: '/friends',
    FOLLOWING: '/following',
    APPEAL: '/appeal',
    TOKEN_REFRESH: '/token-refresh',
    BUSINESS_SUITE: '/business-suite',
    BANNED: '/banned'
} as const

export const LEGAL_ROUTES = {
    PRIVACY_POLICY: '/privacy-policy',
    TERMS_OF_SERVICE: '/terms-of-service'
} as const

export const AUTH_ROUTES = {
    LOGIN: '/login',
    SIGN_UP: '/signup',
    REGISTER: '/register',
    OAUTH: '/oauth',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
    TOKEN_REFRESH: '/token-refresh'
} as const

export const SNAPISTUDIO_ROUTES = {
    ROOT: '/snapistudio',
    CONTENT: '/snapistudio/content',
    APPEALS: '/snapistudio/appeals',
    SETTINGS: '/snapistudio/settings',
    UPLOAD: '/snapistudio/upload',
    UPLOAD_POST: (postId: string) => `/snapistudio/upload/post/${postId}`,
    SCHEDULED_POSTS: '/snapistudio/scheduled-posts',
    WELLNESS: '/snapistudio/wellness'
} as const

export const USER_ROUTES = {
    PROFILE: (username: string) => `/@${username}`,
    VIDEO: (username: string, videoId: string) => `/@${username}/video/${videoId}`
} as const

export const ADMIN_ROUTES = {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    POSTS: '/admin/posts',
    COMMENTS: '/admin/comments',
    APPEALS: '/admin/appeals',
    ACTIVITY: '/admin/activity',
    SETTINGS: '/admin/settings',
    AI_STUDIO: '/admin/ai-studio/metrics',
    AI_STUDIO_PROMPT_TEMPLATES: '/admin/ai-studio/prompt-templates',
    AI_STUDIO_KNOWLEDGE: '/admin/ai-studio/knowledge',
    SCHEDULED_POSTS: '/admin/scheduled-posts'
} as const

export type AdminRoute = (typeof ADMIN_ROUTES)[keyof typeof ADMIN_ROUTES]
