import type { ApiSuccessResponse, ApiSuccessResponseWithMeta } from '@/types/common/http-response.type'

interface AdminPostAuthor {
    readonly id: number
    readonly uuid?: string | null
    readonly username: string
    readonly avatar: string | null
}

export interface AdminPost {
    readonly id: number
    readonly uuid: string
    readonly user_id: number
    readonly user_uuid?: string | null
    readonly author?: AdminPostAuthor
    readonly content: string
    readonly created_at: string
    readonly deleted_at: string | null
}

export type GetAdminPostsRes = ApiSuccessResponseWithMeta<AdminPost[]>
export type DeletePostRes = ApiSuccessResponse
