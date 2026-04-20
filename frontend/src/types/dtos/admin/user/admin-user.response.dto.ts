import { z } from 'zod'
import type { ApiSuccessResponse } from '@/types/common/http-response.type'
import {
    ApiSuccessResponseSchema,
    ApiSuccessResponseWithDataSchema,
    ApiSuccessResponseWithMetaSchema
} from '@/types/common/http-response.type'
import type { PaginationMeta } from '@/types/common/pagination-meta.type'

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

export const GetAdminUsersResSchema = ApiSuccessResponseWithMetaSchema(z.array(AdminUserSchema))

export const BanUserResSchema = ApiSuccessResponseWithDataSchema(AdminUserSchema)

export const UnbanUserResSchema = ApiSuccessResponseWithDataSchema(AdminUserSchema)

export const DeleteUserResSchema = ApiSuccessResponseSchema

export const CommonMessageResSchema = ApiSuccessResponseSchema

export type AdminUser = z.infer<typeof AdminUserSchema>
export type GetAdminUsersRes = ApiSuccessResponse & { data: AdminUser[]; meta: PaginationMeta }
export type BanUserRes = ApiSuccessResponse & { data: AdminUser }
export type UnbanUserRes = ApiSuccessResponse & { data: AdminUser }
export type DeleteUserRes = ApiSuccessResponse
export type CommonMessageRes = ApiSuccessResponse
