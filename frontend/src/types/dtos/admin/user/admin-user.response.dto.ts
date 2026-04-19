import { z } from 'zod'
import type { HttpResponse, HttpResponseWithData, HttpResponseWithMeta } from '@/types/common/http-response.type'
import { AdminApiBaseResponseSchema, AdminListMetaSchema } from '../common/admin-common.response.dto'

export const AdminUserSchema = z
    .object({
        id: z.number().int().positive(),
        uuid: z.string(),
        username: z.string(),
        email: z.string(),
        avatar: z.string().nullable(),
        created_at: z.string(),
        banned_at: z.string().nullable(),
        ban_reason: z.string().nullable()
    })
    .strict()

export const GetAdminUsersResSchema = AdminApiBaseResponseSchema.extend({
    data: z.array(AdminUserSchema),
    meta: AdminListMetaSchema
}).strict()

export const BanUserResSchema = AdminApiBaseResponseSchema.extend({
    data: AdminUserSchema
}).strict()

export const UnbanUserResSchema = AdminApiBaseResponseSchema.extend({
    data: AdminUserSchema
}).strict()

export const DeleteUserResSchema = AdminApiBaseResponseSchema.strict()

export const CommonMessageResSchema = AdminApiBaseResponseSchema.strict()

export type AdminUser = z.infer<typeof AdminUserSchema>
export type GetAdminUsersRes = HttpResponseWithMeta<AdminUser[], z.infer<typeof AdminListMetaSchema>>
export type BanUserRes = HttpResponseWithData<AdminUser>
export type UnbanUserRes = HttpResponseWithData<AdminUser>
export type DeleteUserRes = HttpResponse
export type CommonMessageRes = HttpResponse
