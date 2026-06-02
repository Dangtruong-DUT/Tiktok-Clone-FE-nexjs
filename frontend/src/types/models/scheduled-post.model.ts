import { SCHEDULED_POST_STATUSES, SCHEDULED_POST_SOURCES } from '@/constants/studio-post'

export type ScheduledPostStatus = (typeof SCHEDULED_POST_STATUSES)[keyof typeof SCHEDULED_POST_STATUSES]
export type ScheduledPostSource = (typeof SCHEDULED_POST_SOURCES)[keyof typeof SCHEDULED_POST_SOURCES]

export interface ScheduledPostType {
    uuid:          string
    status:        ScheduledPostStatus
    status_label:  string
    source:        ScheduledPostSource
    scheduled_at:  string
    user_timezone: string
    published_at:  string | null
    error_message: string | null
    post: {
        uuid:    string
        content: string | null
        status:  string
    } | null
    created_at: string
}

export interface ScheduledPostDailySeries {
    date:      string
    total:     number
    published: number
    failed:    number
    cancelled: number
    pending:   number
}

export interface ScheduledPostTopScheduler {
    uuid:      string
    username:  string
    name:      string
    total:     number
    published: number
}

export interface AdminScheduledPostMetrics {
    period:            string
    total:             number
    pending:           number
    published:         number
    failed:            number
    cancelled:         number
    success_rate:      number | null
    avg_delay_minutes: number | null
    by_source:         { manual: number; calendar: number }
    daily_series:      ScheduledPostDailySeries[]
    top_schedulers:    ScheduledPostTopScheduler[]
}

export interface AdminScheduledPostItem extends ScheduledPostType {
    user: { uuid: string; username: string; name: string } | null
}
