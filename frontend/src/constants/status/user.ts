export const UserStatus = {
    ACTIVE: 'active',
    BANNED: 'banned',
    DELETED: 'deleted'
} as const

export type UserStatusType = (typeof UserStatus)[keyof typeof UserStatus]

export const USER_STATUS_VALUES = Object.values(UserStatus) as [UserStatusType, ...UserStatusType[]]

export const UserStatusFilter = {
    ALL: 'all',
    ACTIVE: UserStatus.ACTIVE,
    BANNED: UserStatus.BANNED,
    DELETED: UserStatus.DELETED
} as const

export type UserStatusFilterType = (typeof UserStatusFilter)[keyof typeof UserStatusFilter]

export const USER_STATUS_FILTER_VALUES = Object.values(UserStatusFilter) as [
    UserStatusFilterType,
    ...UserStatusFilterType[]
]
