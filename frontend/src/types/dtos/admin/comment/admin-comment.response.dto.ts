import { z } from 'zod'
import type { HttpResponse, HttpResponseWithMeta } from '@/types/common/http-response.type'
import { AdminApiBaseResponseSchema, AdminListMetaSchema } from '../common/admin-common.response.dto'

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

export const GetAdminCommentsResSchema = AdminApiBaseResponseSchema.extend({
    data: z.array(AdminCommentSchema),
    meta: AdminListMetaSchema
}).strict()

export const DeleteCommentResSchema = AdminApiBaseResponseSchema.strict()

export type AdminComment = z.infer<typeof AdminCommentSchema>
export type GetAdminCommentsRes = HttpResponseWithMeta<AdminComment[], z.infer<typeof AdminListMetaSchema>>
export type DeleteCommentRes = HttpResponse
