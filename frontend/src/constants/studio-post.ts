export const APP_TIMEZONE = 'Asia/Ho_Chi_Minh'

export const STUDIO_POST_STATUSES = {
    DRAFT: 'draft',
    SCHEDULED: 'scheduled',
    PUBLISHED: 'published',
    FAILED: 'failed',
    ARCHIVED: 'archived',
    HIDDEN: 'hidden'
} as const

export const SCHEDULED_POST_STATUSES = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    PUBLISHED: 'published',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
} as const

export const SCHEDULED_POST_SOURCES = {
    MANUAL: 'manual',
    CALENDAR: 'calendar'
} as const
