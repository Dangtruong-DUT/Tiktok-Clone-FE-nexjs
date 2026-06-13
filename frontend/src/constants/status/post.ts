import type { LucideIcon } from 'lucide-react'
import { Globe, Lock, Users } from 'lucide-react'

export interface AudienceConfig {
    labelKey: string
    icon: LucideIcon
}

export const AUDIENCE_CONFIGS: Record<number, AudienceConfig> = {
    0: { labelKey: 'posts.audience.public', icon: Globe },
    1: { labelKey: 'posts.audience.private', icon: Lock },
    2: { labelKey: 'posts.audience.friends', icon: Users },
    3: { labelKey: 'posts.audience.following', icon: Users }
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
    DELETED: PostStatus.DELETED,
    PUBLISHED: 'published',
    SCHEDULED: 'scheduled',
    DRAFT: 'draft',
    FAILED: 'failed',
    ARCHIVED: 'archived',
} as const

export type PostStatusFilterType = (typeof PostStatusFilter)[keyof typeof PostStatusFilter]

export const POST_STATUS_FILTER_VALUES = Object.values(PostStatusFilter) as [
    PostStatusFilterType,
    ...PostStatusFilterType[]
]

export const POST_STATUS_BADGE: Record<string, string> = {
    published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    draft: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    archived: 'bg-amber-100 text-amber-700 dark:bg-amber-800/40 dark:text-amber-300',

    deleted: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    visible: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
}
