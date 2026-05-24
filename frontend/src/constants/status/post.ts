export const PostStatus = {
    VISIBLE: 'visible',
    DELETED: 'deleted'
} as const

export type PostStatusType = (typeof PostStatus)[keyof typeof PostStatus]

export const POST_STATUS_VALUES = Object.values(PostStatus) as [PostStatusType, ...PostStatusType[]]

export const PostStatusFilter = {
    ALL: 'all',
    VISIBLE: PostStatus.VISIBLE,
    DELETED: PostStatus.DELETED
} as const

export type PostStatusFilterType = (typeof PostStatusFilter)[keyof typeof PostStatusFilter]

export const POST_STATUS_FILTER_VALUES = Object.values(PostStatusFilter) as [
    PostStatusFilterType,
    ...PostStatusFilterType[]
]
