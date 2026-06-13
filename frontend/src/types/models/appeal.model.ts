import { z } from 'zod'
import {
    APPEAL_RESOURCE_TYPE_VALUES,
    APPEAL_STATUS_VALUES,
    APPEAL_TYPE_VALUES,
    RESOURCE_PREVIEW_TYPES,
    type AppealResourceType,
    type AppealStatus,
    type AppealType
} from '@/constants/appeal'

export const AppealTypeSchema = z.enum(APPEAL_TYPE_VALUES)
export const AppealStatusSchema = z.enum(APPEAL_STATUS_VALUES)
export const AppealResourceTypeSchema = z.enum(APPEAL_RESOURCE_TYPE_VALUES)

export type { AppealType, AppealStatus, AppealResourceType, AppealReviewAction } from '@/constants/appeal'

export interface ResourcePreviewAuthor {
    readonly username: string
    readonly avatar: string | null
}

export interface ResourcePreviewBase {
    readonly uuid?: string | null
    readonly content: string | null
    readonly is_deleted?: boolean
    readonly author?: ResourcePreviewAuthor | null
    readonly created_at?: string | null
}

export interface PostResourcePreview extends ResourcePreviewBase {
    readonly type: typeof RESOURCE_PREVIEW_TYPES.POST
    readonly thumbnail_url?: string | null
    readonly likes_count?: number
    readonly comments_count?: number
}

export interface CommentResourcePreview extends ResourcePreviewBase {
    readonly type: typeof RESOURCE_PREVIEW_TYPES.COMMENT
}

export interface UserResourcePreview {
    readonly type: typeof RESOURCE_PREVIEW_TYPES.USER
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
