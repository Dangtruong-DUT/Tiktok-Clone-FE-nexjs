/**
 * Admin Helper Functions
 * Formatting, styling, and label utilities for admin UI.
 * Action/label values must match backend AdminActionEnum and ActivityTypeEnum.
 */

import { ADMIN_ACTIONS } from '@/constants/admin.const'
import { formatNumber } from '@/utils/formatting/formatNumber.util'

// ─── Date Formatting ─────────────────────────────────────────────────────────

export function formatAdminDate(dateString: string): string {
    if (!dateString) return '-'
    try {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(new Date(dateString))
    } catch {
        return dateString
    }
}

export function formatAdminDateShort(dateString: string): string {
    if (!dateString) return '-'
    try {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date(dateString))
    } catch {
        return dateString
    }
}

// ─── User Status ─────────────────────────────────────────────────────────────

export function getUserStatus(user: {
    deleted_at?: string | null
    banned_at?: string | null
}): 'active' | 'banned' | 'deleted' {
    if (user.deleted_at) return 'deleted'
    if (user.banned_at) return 'banned'
    return 'active'
}

export function getUserStatusColor(status: 'active' | 'banned' | 'deleted'): string {
    const colors: Record<typeof status, string> = {
        active: 'bg-green-100 text-green-800',
        banned: 'bg-red-100 text-red-800',
        deleted: 'bg-neutral-100 text-neutral-800'
    }
    return colors[status]
}

export function formatUserStatus(status: 'active' | 'banned' | 'deleted'): string {
    const labels: Record<typeof status, string> = {
        active: 'Active',
        banned: 'Banned',
        deleted: 'Deleted'
    }
    return labels[status]
}

// ─── Post Status ─────────────────────────────────────────────────────────────

export function getPostStatusColor(status: 'visible' | 'deleted'): string {
    return status === 'deleted'
        ? 'bg-red-100 text-red-800'
        : 'bg-green-100 text-green-800'
}

export function getPostStatus(post: { deleted_at?: string | null }): 'visible' | 'deleted' {
    return post.deleted_at ? 'deleted' : 'visible'
}

// ─── Text ─────────────────────────────────────────────────────────────────────

export function truncateText(text: string, maxLength: number = 100): string {
    if (!text) return ''
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

export function formatReason(reason: string | null | undefined): string {
    if (!reason) return 'No reason provided'
    return truncateText(reason, 150)
}

// ─── Activity / Action Labels ─────────────────────────────────────────────────
// Keys match backend AdminActionEnum and ActivityTypeEnum values exactly.

const ACTIVITY_LABEL_MAP: Record<string, string> = {
    // Admin actions (AdminActionEnum)
    [ADMIN_ACTIONS.BAN]: 'Ban User',
    [ADMIN_ACTIONS.UNBAN]: 'Unban User',
    [ADMIN_ACTIONS.DELETE_USER]: 'Delete User',
    [ADMIN_ACTIONS.RESTORE_USER]: 'Restore User',
    [ADMIN_ACTIONS.DELETE_POST]: 'Delete Post',
    [ADMIN_ACTIONS.RESTORE_POST]: 'Restore Post',
    [ADMIN_ACTIONS.DELETE_COMMENT]: 'Delete Comment',
    [ADMIN_ACTIONS.RESTORE_COMMENT]: 'Restore Comment',
    [ADMIN_ACTIONS.RESET_USER_PASSWORD]: 'Reset User Password',
    [ADMIN_ACTIONS.SEND_EMAIL_TO_USER]: 'Send Email',
    [ADMIN_ACTIONS.APPROVE_APPEAL]: 'Approve Appeal',
    [ADMIN_ACTIONS.REJECT_APPEAL]: 'Reject Appeal',
    [ADMIN_ACTIONS.UPDATE]: 'Update',
    // System activity types (ActivityTypeEnum)
    user_created: 'User Created',
    user_registered: 'User Registered',
    user_verified: 'User Verified',
    user_banned: 'User Banned',
    user_unbanned: 'User Unbanned',
    post_uploaded: 'Post Uploaded',
    post_deleted: 'Post Deleted',
    post_liked: 'Post Liked',
    post_unliked: 'Post Unliked',
    post_bookmarked: 'Post Bookmarked',
    comment_created: 'Comment Created',
    comment_deleted: 'Comment Deleted',
    user_followed: 'User Followed',
    user_unfollowed: 'User Unfollowed',
    password_changed: 'Password Changed',
    login: 'Login',
    logout: 'Logout'
}

export function getActivityLabel(activity: string): string {
    return ACTIVITY_LABEL_MAP[activity] ?? activity
}

/** Alias kept for backward compatibility */
export const getActionLabel = getActivityLabel

// ─── Misc ─────────────────────────────────────────────────────────────────────

export function isRecentAction(dateString: string | null, hoursThreshold = 24): boolean {
    if (!dateString) return false
    const diffInHours = (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60)
    return diffInHours < hoursThreshold
}

export { formatNumber }
