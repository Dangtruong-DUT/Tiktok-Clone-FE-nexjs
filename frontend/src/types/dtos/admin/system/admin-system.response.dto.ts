import { z } from 'zod'
import type { ApiSuccessResponse } from '@/types/common/http-response.type'
import { ApiSuccessResponseWithDataSchema, ApiSuccessResponseWithMetaSchema } from '@/types/common/http-response.type'
import { AdminResourceTypeSchema } from '../common/admin-common.request.dto'
import type { PaginationMeta } from '@/types/common/pagination-meta.type'

export const AdminLogSchema = z
    .object({
        id: z.number().int().positive(),
        admin_id: z.number().int().positive(),
        admin_uuid: z.string().nullable().optional(),
        admin: z
            .object({
                id: z.number().int().positive(),
                uuid: z.string().nullable(),
                username: z.string(),
                avatar: z.string().nullable()
            })
            .optional(),
        resource_type: AdminResourceTypeSchema.nullable(),
        resource_id: z.union([z.string(), z.number()]),
        action: z.string(),
        reason: z.string().nullable(),
        old_data: z.record(z.string(), z.unknown()).nullable(),
        new_data: z.record(z.string(), z.unknown()).nullable(),
        ip_address: z.string().nullable().optional(),
        created_at: z.string()
    })
    .strict()

export const ActivityLogSchema = z
    .object({
        id: z.number().int().positive(),
        user_id: z.number().int().positive().nullable(),
        user_uuid: z.string().nullable().optional(),
        user: z
            .object({
                id: z.number().int().positive(),
                uuid: z.string().nullable(),
                username: z.string(),
                avatar: z.string().nullable()
            })
            .optional(),
        action_type: z.string(),
        resource_type: AdminResourceTypeSchema.nullable(),
        resource_id: z.union([z.string(), z.number()]).nullable(),
        metadata: z.record(z.string(), z.unknown()).nullable(),
        ip_address: z.string().nullable().optional(),
        created_at: z.string()
    })
    .strict()

export const GetActivityLogsResSchema = ApiSuccessResponseWithMetaSchema(
    z.array(z.union([AdminLogSchema, ActivityLogSchema]))
)

export const DashboardStatsSchema = z
    .object({
        total_users: z.number().int().nonnegative(),
        active_users: z.number().int().nonnegative(),
        banned_users: z.number().int().nonnegative(),
        total_posts: z.number().int().nonnegative(),
        deleted_posts: z.number().int().nonnegative(),
        total_comments: z.number().int().nonnegative(),
        total_admin_actions: z.number().int().nonnegative(),
        new_users_this_period: z.number().int().nonnegative(),
        new_posts_this_period: z.number().int().nonnegative()
    })
    .strict()

export const GetDashboardStatsResSchema = ApiSuccessResponseWithDataSchema(DashboardStatsSchema)

export type AdminLog = z.infer<typeof AdminLogSchema>
export type ActivityLog = z.infer<typeof ActivityLogSchema>
export type AdminActivityListItem = AdminLog | ActivityLog
export type GetActivityLogsRes = ApiSuccessResponse & { data: AdminActivityListItem[]; meta: PaginationMeta }
export type DashboardStats = z.infer<typeof DashboardStatsSchema>
export type GetDashboardStatsRes = ApiSuccessResponse & { data: DashboardStats }
