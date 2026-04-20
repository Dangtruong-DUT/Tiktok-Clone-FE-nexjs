import { z } from 'zod'
import type { ApiSuccessResponse } from '@/types/common/http-response.type'
import { ApiSuccessResponseSchema, ApiSuccessResponseWithMetaSchema } from '@/types/common/http-response.type'
import type { PaginationMeta } from '@/types/common/pagination-meta.type'

export const AdminCommentSchema = z
    .object({
        id: z.number().int().positive(),
        uuid: z.string(),
        user_id: z.number().int().positive(),
        user_uuid: z.string().nullable().optional(),
        parent_id: z.number().int().positive().nullable(),
        parent_uuid: z.string().nullable().optional(),
        author: z
            .object({
                id: z.number().int().positive(),
                uuid: z.string().nullable(),
                username: z.string(),
                avatar: z.string().nullable()
            })
            .optional(),
        content: z.string(),
        created_at: z.string(),
        likes_count: z.number()
    })
    .strict()

export const GetAdminCommentsResSchema = ApiSuccessResponseWithMetaSchema(z.array(AdminCommentSchema))

export const DeleteCommentResSchema = ApiSuccessResponseSchema

export type AdminComment = z.infer<typeof AdminCommentSchema>
export type GetAdminCommentsRes = ApiSuccessResponse & { data: AdminComment[]; meta: PaginationMeta }
export type DeleteCommentRes = ApiSuccessResponse
