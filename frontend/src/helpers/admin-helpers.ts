/**
 * Admin Helper Functions
 * Formatting, styling, and data utilities for admin UI.
 * Text labels should be resolved via i18n (useTranslations) in components.
 */

import { formatNumber } from '@/utils/formatting/formatNumber.util'

// ─── Date Formatting ─────────────────────────────────────────────────────────

export function formatAdminDate(dateString: string, locale = 'en-US'): string {
    if (!dateString) return '-'
    try {
        return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
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

export function formatAdminDateShort(dateString: string, locale = 'en-US'): string {
    if (!dateString) return '-'
    try {
        return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
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
        active: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
        banned: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
        deleted: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
    }
    return colors[status]
}

// ─── Post Status ─────────────────────────────────────────────────────────────

export function getPostStatus(post: { deleted_at?: string | null }): 'visible' | 'deleted' {
    return post.deleted_at ? 'deleted' : 'visible'
}

export function getPostStatusColor(status: 'visible' | 'deleted'): string {
    return status === 'deleted'
        ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
        : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
}

// ─── Text ─────────────────────────────────────────────────────────────────────

export function truncateText(text: string, maxLength = 100): string {
    if (!text) return ''
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

// ─── Activity Key Resolution ──────────────────────────────────────────────────
// Returns the action key — use with t(`actionLabels.${key}`) in components.

export function getActivityKey(log: { action?: string; action_type?: string }): string {
    return log.action ?? log.action_type ?? 'unknown'
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export function isRecentAction(dateString: string | null, hoursThreshold = 24): boolean {
    if (!dateString) return false
    const diffInHours = (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60)
    return diffInHours < hoursThreshold
}

export { formatNumber }
