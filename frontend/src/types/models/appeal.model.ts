import { z } from 'zod'
import { APPEAL_RESOURCE_TYPE_VALUES, APPEAL_STATUS_VALUES, APPEAL_TYPE_VALUES } from '@/constants/appeal.const'

// ─── Zod schemas (runtime validation) ────────────────────────────────────────

export const AppealTypeSchema = z.enum(APPEAL_TYPE_VALUES)
export const AppealStatusSchema = z.enum(APPEAL_STATUS_VALUES)
export const AppealResourceTypeSchema = z.enum(APPEAL_RESOURCE_TYPE_VALUES)

// ─── Literal union types ──────────────────────────────────────────────────────

export type AppealType = (typeof APPEAL_TYPE_VALUES)[number]
export type AppealStatus = (typeof APPEAL_STATUS_VALUES)[number]
export type AppealResourceType = (typeof APPEAL_RESOURCE_TYPE_VALUES)[number]

// ─── Supporting types ─────────────────────────────────────────────────────────

interface ResourcePreviewAuthor {
    readonly username: string
    readonly avatar: string | null
}

interface ResourcePreviewBase {
    readonly uuid?: string | null
    readonly content: string | null
    readonly is_deleted?: boolean
    readonly author?: ResourcePreviewAuthor | null
    readonly created_at?: string | null
}

interface PostResourcePreview extends ResourcePreviewBase {
    readonly type: 'post'
    readonly thumbnail_url?: string | null
    readonly likes_count?: number
    readonly comments_count?: number
}

interface CommentResourcePreview extends ResourcePreviewBase {
    readonly type: 'comment'
}

interface UserResourcePreview {
    readonly type: 'user'
    readonly uuid?: string | null
    readonly username: string
    readonly avatar?: string | null
    readonly is_banned?: boolean
    readonly is_deleted?: boolean
}

export type ResourcePreview = PostResourcePreview | CommentResourcePreview | UserResourcePreview

export interface EvidenceFile {
    readonly id: number
    readonly url: string
    readonly file_name: string
}

// ─── Domain model ─────────────────────────────────────────────────────────────

export interface Appeal {
    readonly id: number
    readonly uuid?: string | null
    readonly user_id: number
    readonly appeal_type: AppealType
    readonly resource_id: number | null
    readonly resource_type: AppealResourceType
    readonly reason: string | null
    readonly status: AppealStatus
    readonly admin_response: string | null
    readonly evidence_files?: EvidenceFile[] | null
    readonly resource_preview?: ResourcePreview | null
    readonly reviewed_at: string | null
    readonly created_at: string
    readonly updated_at: string
}
