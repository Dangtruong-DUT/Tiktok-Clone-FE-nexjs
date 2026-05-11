import type { ApiSuccessResponse } from '@/types/common/http-response.type'
import type { PaginationMeta } from '@/types/common/pagination-meta.type'

type AdminPostAuthor = {
    readonly id: number
    readonly uuid?: string | null
    readonly username: string
    readonly avatar: string | null
}

export type AdminPost = {
    readonly id: number
    readonly uuid: string
    readonly user_id: number
    readonly user_uuid?: string | null
    readonly author?: AdminPostAuthor
    readonly content: string
    readonly created_at: string
    readonly deleted_at: string | null
}

export type GetAdminPostsRes = ApiSuccessResponse & { data: AdminPost[]; meta: PaginationMeta }
export type DeletePostRes = ApiSuccessResponse
