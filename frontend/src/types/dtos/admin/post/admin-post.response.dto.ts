import { z } from 'zod'
import type { HttpResponse, HttpResponseWithMeta } from '@/types/common/http-response.type'
import { AdminApiBaseResponseSchema, AdminListMetaSchema } from '../common/admin-common.response.dto'

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

export const GetAdminPostsResSchema = AdminApiBaseResponseSchema.extend({
    data: z.array(AdminPostSchema),
    meta: AdminListMetaSchema
}).strict()

export const DeletePostResSchema = AdminApiBaseResponseSchema.strict()

export type AdminPost = z.infer<typeof AdminPostSchema>
export type GetAdminPostsRes = HttpResponseWithMeta<AdminPost[], z.infer<typeof AdminListMetaSchema>>
export type DeletePostRes = HttpResponse
