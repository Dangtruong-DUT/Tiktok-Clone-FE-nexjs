import { STUDIO_POST_STATUSES } from '@/constants/studio-post'

export type StudioPostStatus = (typeof STUDIO_POST_STATUSES)[keyof typeof STUDIO_POST_STATUSES]

interface StudioScheduledPostBrief {
    uuid: string
    status: string
    scheduled_at: string
    error_message: string | null
}

export interface StudioPostItem {
    uuid: string
    content: string | null
    thumbnail_url: string | null
    audience: number | null
    status: StudioPostStatus
    status_label: string
    published_at: string | null
    updated_at: string
    created_at: string
    scheduled_post: StudioScheduledPostBrief | null
}
