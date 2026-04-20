/**
 * Admin Helper Functions - Utility functions for formatting and styling admin data
 */

import { formatNumber } from '@/utils/formatting/formatNumber.util'

/**
 * Format date to readable format with time
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
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

/**
 * Format date to short format (MM/DD/YYYY)
 */
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

/**
 * Get CSS class for user status badge
 */
export function getUserStatusColor(isBanned: boolean): string {
    return isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
}

/**
 * Get display text for user status
 */
export function formatUserStatus(isBanned: boolean): string {
    return isBanned ? 'Banned' : 'Active'
}

/**
 * Get CSS class for post status badge
 */
export function getPostStatusColor(status: 'visible' | 'deleted'): string {
    const colors = {
        visible: 'bg-green-100 text-green-800',
        deleted: 'bg-red-100 text-red-800'
    }
    return colors[status]
}

/**
 * Determine post status from model data
 */
export function getPostStatus(post: { deleted_at?: string | null }): 'visible' | 'deleted' {
    if (post.deleted_at) return 'deleted'
    return 'visible'
}

/**
 * Truncate text to maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number = 100): string {
    if (!text) return ''
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

/**
 * Format reason for display
 */
export function formatReason(reason: string | null | undefined): string {
    if (!reason) return 'No reason provided'
    return truncateText(reason, 150)
}

/**
 * Get action label for display
 */
export function getActionLabel(action: string): string {
    const actionLabels: Record<string, string> = {
        ban: 'Ban User',
        unban: 'Unban User',
        delete_user: 'Delete User',
        delete_post: 'Delete Post',
        delete_comment: 'Delete Comment'
    }
    return actionLabels[action] || action
}

/**
 * Get activity label for display
 */
export function getActivityLabel(activity: string): string {
    const labels: Record<string, string> = {
        ban: 'Ban User',
        unban: 'Unban User',
        delete_user: 'Delete User',
        delete_post: 'Delete Post',
        delete_comment: 'Delete Comment',
        reset_user_password: 'Reset User Password',
        send_email_to_user: 'Send Email To User',
        user_created: 'User Created',
        user_registered: 'User Registered',
        user_verified: 'User Verified',
        user_banned: 'User Banned',
        user_unbanned: 'User Unbanned',
        post_uploaded: 'Post Uploaded',
        post_deleted: 'Post Deleted',
        post_liked: 'Post Liked',
        comment_created: 'Comment Created',
        comment_deleted: 'Comment Deleted',
        user_followed: 'User Followed',
        login: 'Login',
        logout: 'Logout'
    }
    return labels[activity] || activity
}

/**
 * Check if need refresh attention (recent ban/deletion)
 */
export function isRecentAction(dateString: string | null, hoursThreshold: number = 24): boolean {
    if (!dateString) return false
    const actionDate = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - actionDate.getTime()) / (1000 * 60 * 60)
    return diffInHours < hoursThreshold
}

export { formatNumber }
