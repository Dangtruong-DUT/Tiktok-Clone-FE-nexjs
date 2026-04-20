/**
 * Admin Constants - Shared constants, enums, and configuration for admin features
 */

export const ADMIN_ACTIONS = {
    BAN: 'BAN_USER',
    UNBAN: 'UNBAN_USER',
    DELETE: 'DELETE_USER',
    DELETE_POST: 'DELETE_POST',
    DELETE_COMMENT: 'DELETE_COMMENT'
} as const

export const USER_STATUS = {
    ACTIVE: 'active',
    BANNED: 'banned',
    ALL: 'all'
} as const

export const POST_STATUS = {
    ALL: 'all',
    VISIBLE: 'visible',
    DELETED: 'deleted'
} as const

export const VIOLATION_REASONS = [
    { value: 'spam', label: 'Spam' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'inappropriate_content', label: 'Inappropriate Content' },
    { value: 'copyright_infringement', label: 'Copyright Infringement' },
    { value: 'misinformation', label: 'Misinformation' },
    { value: 'hate_speech', label: 'Hate Speech' },
    { value: 'violence', label: 'Violence' }
] as const

export const ACTIVITY_TYPES = [
    { value: 'ban', label: 'Ban User' },
    { value: 'unban', label: 'Unban User' },
    { value: 'delete_user', label: 'Delete User' },
    { value: 'delete_post', label: 'Delete Post' },
    { value: 'delete_comment', label: 'Delete Comment' },
    { value: 'reset_user_password', label: 'Reset User Password' },
    { value: 'send_email_to_user', label: 'Send Email To User' }
] as const

export const ADMIN_ROUTES = {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    POSTS: '/admin/posts',
    COMMENTS: '/admin/comments',
    ACTIVITY: '/admin/activity'
} as const

export const PAGINATION_DEFAULTS = {
    PER_PAGE: 20,
    MAX_PER_PAGE: 100
} as const

export const TIME_PERIODS = {
    TODAY: 'today',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year'
} as const

export const SORT_OPTIONS = {
    ID: 'id',
    CREATED_AT: 'created_at',
    '-ID': '-id',
    '-CREATED_AT': '-created_at',
    USERNAME: 'username',
    '-USERNAME': '-username',
    LIKES: 'likes_count',
    '-LIKES': '-likes_count'
} as const
