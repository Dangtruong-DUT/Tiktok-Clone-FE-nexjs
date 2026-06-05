import type { LucideIcon } from 'lucide-react'
import { Globe, Lock, Users } from 'lucide-react'

export interface AudienceConfig {
    labelKey: string
    icon: LucideIcon
}

export const AUDIENCE_CONFIGS: Record<string, AudienceConfig> = {
    everyone: { labelKey: 'posts.audience.public', icon: Globe },
    friends: { labelKey: 'posts.audience.friends', icon: Users },
    only_me: { labelKey: 'posts.audience.private', icon: Lock },
}

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
