import { z } from 'zod'
import type { ApiSuccessResponse } from '@/types/common/http-response.type'
import { ApiSuccessResponseSchema, ApiSuccessResponseWithMetaSchema } from '@/types/common/http-response.type'
import type { PaginationMeta } from '@/types/common/pagination-meta.type'

export const AdminPostSchema = z
    .object({
        id: z.number().int().positive(),
        uuid: z.string(),
        user_id: z.number().int().positive(),
        user_uuid: z.string().nullable().optional(),
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
        deleted_at: z.string().nullable()
    })
    .strict()

export const GetAdminPostsResSchema = ApiSuccessResponseWithMetaSchema(z.array(AdminPostSchema))

export const DeletePostResSchema = ApiSuccessResponseSchema

export type AdminPost = z.infer<typeof AdminPostSchema>
export type GetAdminPostsRes = ApiSuccessResponse & { data: AdminPost[]; meta: PaginationMeta }
export type DeletePostRes = ApiSuccessResponse
