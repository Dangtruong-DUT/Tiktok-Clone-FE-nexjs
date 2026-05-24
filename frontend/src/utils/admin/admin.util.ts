import { UserStatus, UserStatusType } from '@/constants/status/user'
import { PostStatus, PostStatusType } from '@/constants/status/post'

export function getUserStatus(user: { deleted_at?: string | null; banned_at?: string | null }): UserStatusType {
    if (user.deleted_at) return UserStatus.DELETED
    if (user.banned_at) return UserStatus.BANNED
    return UserStatus.ACTIVE
}

export function getUserStatusColor(status: UserStatusType): string {
    const colors: Record<UserStatusType, string> = {
        [UserStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
        [UserStatus.BANNED]: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
        [UserStatus.DELETED]: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
    }
    return colors[status]
}

export function getPostStatus(post: { deleted_at?: string | null }): PostStatusType {
    return post.deleted_at ? PostStatus.DELETED : PostStatus.VISIBLE
}

export function getPostStatusColor(status: PostStatusType): string {
    return status === PostStatus.DELETED
        ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
        : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
}

export function truncateText(text: string, maxLength = 100): string {
    if (!text) return ''
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

export function getActivityKey(log: { action?: string; action_type?: string }): string {
    return log.action ?? log.action_type ?? 'unknown'
}

export function isRecentAction(dateString: string | null, hoursThreshold = 24): boolean {
    if (!dateString) return false
    const diffInHours = (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60)
    return diffInHours < hoursThreshold
}
