// Values must match backend PHP enums exactly
export const USER_STATUS = {
    ACTIVE: 'active',
    BANNED: 'banned',
    DELETED: 'deleted',
    ALL: 'all'
} as const

export type UserStatusFilter = (typeof USER_STATUS)[keyof typeof USER_STATUS]

export const POST_STATUS = {
    ALL: 'all',
    VISIBLE: 'visible',
    DELETED: 'deleted'
} as const

export type PostStatusFilter = (typeof POST_STATUS)[keyof typeof POST_STATUS]
