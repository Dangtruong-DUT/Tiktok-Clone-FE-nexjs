import { UserStatus, UserStatusType } from '@/constants/status/user'
import { PostStatus, PostStatusType } from '@/constants/status/post'
import { ADMIN_ACTION_ICONS, type ActionIconConfig } from '@/constants/admin/actions'
import type { AdminActivityListItem, ActivityLog } from '@/types/dtos/admin/admin-response.dto'
import { ShieldCheck } from 'lucide-react'

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

const DEFAULT_ICON_CONFIG: ActionIconConfig = {
    icon: ShieldCheck,
    className: 'bg-zinc-500/15 text-zinc-400'
}

export function getActionIconConfig(actionKey: string): ActionIconConfig {
    return ADMIN_ACTION_ICONS[actionKey] ?? DEFAULT_ICON_CONFIG
}

export function getActivityActorName(log: AdminActivityListItem): string | undefined {
    if ('action' in log) return log.admin?.username
    if ('action_type' in log) return (log as ActivityLog).user?.username
    return undefined
}

export interface ActivityResourceRef {
    text: string
    isUserRef: boolean
}

function extractTargetUsername(log: AdminActivityListItem): string | null {
    if (!('action' in log)) return null
    const oldUsername = (log.old_data as Record<string, unknown> | null)?.username
    const newUsername = (log.new_data as Record<string, unknown> | null)?.target_username
    return (
        (typeof oldUsername === 'string' ? oldUsername : null) ?? (typeof newUsername === 'string' ? newUsername : null)
    )
}

export function formatActivityResourceRef(log: AdminActivityListItem): string {
    const resourceId = log.resource_id
    if (!resourceId) return ''
    if (log.resource_type === 'user') {
        const username = extractTargetUsername(log)
        return username ? `@${username}` : `@${resourceId}`
    }
    const prefix = log.resource_type ? log.resource_type.charAt(0).toUpperCase() : 'R'
    return `${prefix}-${resourceId}`
}

export function formatActivityResourceRefStyled(log: AdminActivityListItem): ActivityResourceRef {
    const resourceId = log.resource_id
    if (!resourceId) return { text: '', isUserRef: false }
    if (log.resource_type === 'user') {
        const username = extractTargetUsername(log)
        return { text: username ? `@${username}` : `@${resourceId}`, isUserRef: true }
    }
    const prefix = log.resource_type ? log.resource_type.charAt(0).toUpperCase() : 'R'
    return { text: `${prefix}-${resourceId}`, isUserRef: false }
}
