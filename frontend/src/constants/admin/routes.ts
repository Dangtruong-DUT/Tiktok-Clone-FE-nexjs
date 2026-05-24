export const ADMIN_ROUTES = {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    POSTS: '/admin/posts',
    COMMENTS: '/admin/comments',
    APPEALS: '/admin/appeals',
    ACTIVITY: '/admin/activity',
    SETTINGS: '/admin/settings'
} as const

export type AdminRoute = (typeof ADMIN_ROUTES)[keyof typeof ADMIN_ROUTES]
