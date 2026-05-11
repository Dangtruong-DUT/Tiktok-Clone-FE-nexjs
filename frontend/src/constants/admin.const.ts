/**
 * Admin Constants — aligned with backend AdminActionEnum, ResourceTypeEnum, etc.
 * Values must match the backend PHP enum string values exactly.
 */

// ─── Admin Action Types (matches backend AdminActionEnum) ────────────────────
export const ADMIN_ACTIONS = {
    BAN: 'ban',
    UNBAN: 'unban',
    DELETE_USER: 'delete_user',
    RESTORE_USER: 'restore_user',
    RESET_USER_PASSWORD: 'reset_user_password',
    SEND_EMAIL_TO_USER: 'send_email_to_user',
    DELETE_POST: 'delete_post',
    RESTORE_POST: 'restore_post',
    DELETE_COMMENT: 'delete_comment',
    RESTORE_COMMENT: 'restore_comment',
    APPROVE_APPEAL: 'approve_appeal',
    REJECT_APPEAL: 'reject_appeal',
    UPDATE: 'update'
} as const

export type AdminAction = (typeof ADMIN_ACTIONS)[keyof typeof ADMIN_ACTIONS]

// ─── User Status Filter ──────────────────────────────────────────────────────
export const USER_STATUS = {
    ACTIVE: 'active',
    BANNED: 'banned',
    DELETED: 'deleted',
    ALL: 'all'
} as const

export type UserStatusFilter = (typeof USER_STATUS)[keyof typeof USER_STATUS]

// ─── Post Status Filter ──────────────────────────────────────────────────────
export const POST_STATUS = {
    ALL: 'all',
    VISIBLE: 'visible',
    DELETED: 'deleted'
} as const

export type PostStatusFilter = (typeof POST_STATUS)[keyof typeof POST_STATUS]

// ─── Violation Reasons ───────────────────────────────────────────────────────
export const VIOLATION_REASONS = [
    { value: 'spam', label: 'Spam' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'inappropriate_content', label: 'Inappropriate Content' },
    { value: 'copyright_infringement', label: 'Copyright Infringement' },
    { value: 'misinformation', label: 'Misinformation' },
    { value: 'hate_speech', label: 'Hate Speech' },
    { value: 'violence', label: 'Violence' }
] as const

// ─── Activity Log Action Types (for filter UI) ───────────────────────────────
export const ACTIVITY_TYPES = [
    { value: ADMIN_ACTIONS.BAN, label: 'Ban User' },
    { value: ADMIN_ACTIONS.UNBAN, label: 'Unban User' },
    { value: ADMIN_ACTIONS.DELETE_USER, label: 'Delete User' },
    { value: ADMIN_ACTIONS.RESTORE_USER, label: 'Restore User' },
    { value: ADMIN_ACTIONS.DELETE_POST, label: 'Delete Post' },
    { value: ADMIN_ACTIONS.RESTORE_POST, label: 'Restore Post' },
    { value: ADMIN_ACTIONS.DELETE_COMMENT, label: 'Delete Comment' },
    { value: ADMIN_ACTIONS.RESTORE_COMMENT, label: 'Restore Comment' },
    { value: ADMIN_ACTIONS.APPROVE_APPEAL, label: 'Approve Appeal' },
    { value: ADMIN_ACTIONS.REJECT_APPEAL, label: 'Reject Appeal' },
    { value: ADMIN_ACTIONS.RESET_USER_PASSWORD, label: 'Reset Password' },
    { value: ADMIN_ACTIONS.SEND_EMAIL_TO_USER, label: 'Send Email' }
] as const

// ─── Admin Routes ────────────────────────────────────────────────────────────
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

// ─── Resource Types (matches backend ResourceTypeEnum) ───────────────────────
export const ADMIN_RESOURCE_TYPES = {
    USER: 'user',
    POST: 'post',
    COMMENT: 'comment',
    MESSAGE: 'message',
    APPEAL: 'appeal',
    RE_POST: 're-post',
    QUOTE_POST: 'quote-post'
} as const

export type AdminResourceType = (typeof ADMIN_RESOURCE_TYPES)[keyof typeof ADMIN_RESOURCE_TYPES]

// ─── Pagination Defaults ─────────────────────────────────────────────────────
export const PAGINATION_DEFAULTS = {
    PER_PAGE: 20,
    MAX_PER_PAGE: 100
} as const

// ─── Time Period Filter ──────────────────────────────────────────────────────
export const TIME_PERIODS = {
    TODAY: 'today',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year'
} as const

export type TimePeriod = (typeof TIME_PERIODS)[keyof typeof TIME_PERIODS]

// ─── Sort Options ────────────────────────────────────────────────────────────
export const SORT_OPTIONS = {
    ID_ASC: 'id',
    ID_DESC: '-id',
    CREATED_ASC: 'created_at',
    CREATED_DESC: '-created_at',
    USERNAME_ASC: 'username',
    USERNAME_DESC: '-username',
    LIKES_ASC: 'likes_count',
    LIKES_DESC: '-likes_count'
} as const

export type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS]
