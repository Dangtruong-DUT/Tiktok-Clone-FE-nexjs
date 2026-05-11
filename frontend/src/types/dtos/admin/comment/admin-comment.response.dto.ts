import type { ApiSuccessResponse } from '@/types/common/http-response.type'
import type { PaginationMeta } from '@/types/common/pagination-meta.type'

type AdminCommentAuthor = {
    readonly id: number
    readonly uuid?: string | null
    readonly username: string
    readonly avatar: string | null
}

export type AdminComment = {
    readonly id: number
    readonly uuid: string
    readonly user_id: number
    readonly user_uuid?: string | null
    readonly parent_id: number | null
    readonly parent_uuid?: string | null
    readonly author?: AdminCommentAuthor
    readonly content: string
    readonly created_at: string
    readonly likes_count: number
}

export type GetAdminCommentsRes = ApiSuccessResponse & { data: AdminComment[]; meta: PaginationMeta }
export type DeleteCommentRes = ApiSuccessResponse
