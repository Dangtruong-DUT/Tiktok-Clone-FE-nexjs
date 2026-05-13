// Values must match backend PHP enums exactly
export const APPEAL_TYPES = {
    USER_BAN: 'user_ban',
    USER_DELETED: 'user_deleted',
    POST_DELETED: 'post_deleted',
    COMMENT_DELETED: 'comment_deleted'
} as const

export const APPEAL_STATUSES = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
} as const

export const APPEAL_RESOURCE_TYPES = {
    USER: 'user',
    POST: 'post',
    COMMENT: 'comment',
    MESSAGE: 'message',
    APPEAL: 'appeal',
    RE_POST: 're-post',
    QUOTE_POST: 'quote-post'
} as const

export const APPEAL_REVIEW_ACTIONS = {
    APPROVE: 'approve',
    REJECT: 'reject'
} as const

export type AppealType = (typeof APPEAL_TYPES)[keyof typeof APPEAL_TYPES]
export type AppealStatus = (typeof APPEAL_STATUSES)[keyof typeof APPEAL_STATUSES]
export type AppealResourceType = (typeof APPEAL_RESOURCE_TYPES)[keyof typeof APPEAL_RESOURCE_TYPES]
export type AppealReviewAction = (typeof APPEAL_REVIEW_ACTIONS)[keyof typeof APPEAL_REVIEW_ACTIONS]

// Typed tuples consumed by Zod schemas in appeal.model.ts
export const APPEAL_TYPE_VALUES = Object.values(APPEAL_TYPES) as [AppealType, ...AppealType[]]
export const APPEAL_STATUS_VALUES = Object.values(APPEAL_STATUSES) as [AppealStatus, ...AppealStatus[]]
export const APPEAL_RESOURCE_TYPE_VALUES = Object.values(APPEAL_RESOURCE_TYPES) as [
    AppealResourceType,
    ...AppealResourceType[]
]
