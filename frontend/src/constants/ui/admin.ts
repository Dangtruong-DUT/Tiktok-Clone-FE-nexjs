import { ADMIN_ACTIONS } from '@/constants/admin'

export type SortOrder = 'recent' | 'oldest'

export const TABLE_HEAD_CLASS = 'text-xs font-semibold uppercase tracking-wide text-muted-foreground' as const

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

export type TimePeriod = (typeof TIME_PERIODS)[keyof typeof TIME_PERIODS]

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
