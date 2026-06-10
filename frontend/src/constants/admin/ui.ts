import { ADMIN_ACTIONS } from '@/constants/admin/actions'

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

export interface AdminLabeledOption<TValue extends string = string> {
    value: TValue
    labelKey: string
}

export const VIOLATION_REASONS = [
    { value: 'spam', labelKey: 'posts.violationReasons.spam' },
    { value: 'harassment', labelKey: 'posts.violationReasons.harassment' },
    { value: 'inappropriate_content', labelKey: 'posts.violationReasons.inappropriateContent' },
    { value: 'copyright_infringement', labelKey: 'posts.violationReasons.copyrightInfringement' },
    { value: 'misinformation', labelKey: 'posts.violationReasons.misinformation' },
    { value: 'hate_speech', labelKey: 'posts.violationReasons.hateSpeech' },
    { value: 'violence', labelKey: 'posts.violationReasons.violence' }
] as const satisfies readonly AdminLabeledOption[]

export const ACTIVITY_TYPES = [
    { value: ADMIN_ACTIONS.BAN, labelKey: 'activity.types.banUser' },
    { value: ADMIN_ACTIONS.UNBAN, labelKey: 'activity.types.unbanUser' },
    { value: ADMIN_ACTIONS.DELETE_USER, labelKey: 'activity.types.deleteUser' },
    { value: ADMIN_ACTIONS.RESTORE_USER, labelKey: 'activity.types.restoreUser' },
    { value: ADMIN_ACTIONS.DELETE_POST, labelKey: 'activity.types.deletePost' },
    { value: ADMIN_ACTIONS.RESTORE_POST, labelKey: 'activity.types.restorePost' },
    { value: ADMIN_ACTIONS.DELETE_COMMENT, labelKey: 'activity.types.deleteComment' },
    { value: ADMIN_ACTIONS.RESTORE_COMMENT, labelKey: 'activity.types.restoreComment' },
    { value: ADMIN_ACTIONS.APPROVE_APPEAL, labelKey: 'activity.types.approveAppeal' },
    { value: ADMIN_ACTIONS.REJECT_APPEAL, labelKey: 'activity.types.rejectAppeal' },
    { value: ADMIN_ACTIONS.RESET_USER_PASSWORD, labelKey: 'activity.types.resetUserPassword' },
    { value: ADMIN_ACTIONS.SEND_EMAIL_TO_USER, labelKey: 'activity.types.sendEmailToUser' }
] as const satisfies readonly AdminLabeledOption[]
