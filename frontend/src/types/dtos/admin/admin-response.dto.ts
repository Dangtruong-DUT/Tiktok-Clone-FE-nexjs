import { z } from 'zod'
import { AdminResourceTypeSchema } from './admin-request.dto'

export const AdminListMetaSchema = z
    .object({
        current_page: z.number().int().nonnegative(),
        last_page: z.number().int().nonnegative(),
        total: z.number().int().nonnegative(),
        per_page: z.number().int().positive()
    })
    .strict()

export const AdminUserSchema = z
    .object({
        id: z.number().int().positive(),
        username: z.string(),
        email: z.string(),
        avatar_url: z.string().nullable(),
        created_at: z.string(),
        banned_at: z.string().nullable(),
        ban_reason: z.string().nullable()
    })
    .strict()

export const GetAdminUsersResSchema = z
    .object({
        data: z.array(AdminUserSchema),
        meta: AdminListMetaSchema
    })
    .strict()

export const BanUserResSchema = z
    .object({
        message: z.string(),
        user: AdminUserSchema
    })
    .strict()

export const UnbanUserResSchema = z
    .object({
        message: z.string(),
        user: AdminUserSchema
    })
    .strict()

export const DeleteUserResSchema = z
    .object({
        message: z.string()
    })
    .strict()

export const CommonMessageResSchema = z
    .object({
        message: z.string()
    })
    .strict()

export const AdminPostSchema = z
    .object({
        id: z.number().int().positive(),
        uuid: z.string(),
        user_id: z.number().int().positive(),
        user: z
            .object({
                id: z.number().int().positive(),
                username: z.string(),
                avatar_url: z.string().nullable()
            })
            .optional(),
        content: z.string(),
        media: z
            .array(
                z
                    .object({
                        id: z.number().int().positive(),
                        post_id: z.number().int().positive(),
                        type: z.string(),
                        url: z.string()
                    })
                    .strict()
            )
            .optional(),
        created_at: z.string(),
        hidden_at: z.string().nullable(),
        hidden_reason: z.string().nullable(),
        likes_count: z.number().optional(),
        comments_count: z.number().optional(),
        shares_count: z.number().optional()
    })
    .strict()

export const GetAdminPostsResSchema = z
    .object({
        data: z.array(AdminPostSchema),
        meta: AdminListMetaSchema
    })
    .strict()

export const HidePostResSchema = z
    .object({
        message: z.string(),
        post: AdminPostSchema
    })
    .strict()

export const UnhidePostResSchema = z
    .object({
        message: z.string(),
        post: AdminPostSchema
    })
    .strict()

export const DeletePostResSchema = z
    .object({
        message: z.string()
    })
    .strict()

export const AdminCommentSchema = z
    .object({
        id: z.number().int().positive(),
        uuid: z.string(),
        user_id: z.number().int().positive(),
        user: z
            .object({
                id: z.number().int().positive(),
                username: z.string(),
                avatar_url: z.string().nullable()
            })
            .optional(),
        parent_id: z.number().int().positive().nullable(),
        parent: z
            .object({
                id: z.number().int().positive(),
                uuid: z.string(),
                user_id: z.number().int().positive(),
                content: z.string(),
                user: z
                    .object({
                        id: z.number().int().positive(),
                        username: z.string()
                    })
                    .optional()
            })
            .optional(),
        content: z.string(),
        created_at: z.string(),
        likes_count: z.number()
    })
    .strict()

export const GetAdminCommentsResSchema = z
    .object({
        data: z.array(AdminCommentSchema),
        meta: AdminListMetaSchema
    })
    .strict()

export const DeleteCommentResSchema = z
    .object({
        message: z.string()
    })
    .strict()

export const AdminLogSchema = z
    .object({
        id: z.number().int().positive(),
        admin_id: z.number().int().positive(),
        admin: z
            .object({
                id: z.number().int().positive(),
                username: z.string(),
                avatar_url: z.string().nullable()
            })
            .optional(),
        resource_type: AdminResourceTypeSchema,
        resource_id: z.union([z.string(), z.number()]),
        action: z.string(),
        reason: z.string().nullable(),
        old_data: z.record(z.string(), z.unknown()).nullable(),
        new_data: z.record(z.string(), z.unknown()).nullable(),
        created_at: z.string()
    })
    .strict()

export const ActivityLogSchema = z
    .object({
        id: z.number().int().positive(),
        user_id: z.number().int().positive().nullable(),
        user: z
            .object({
                id: z.number().int().positive(),
                username: z.string(),
                avatar_url: z.string().nullable()
            })
            .optional(),
        activity_type: z.string(),
        resource_type: AdminResourceTypeSchema.nullable(),
        resource_id: z.union([z.string(), z.number()]).nullable(),
        metadata: z.record(z.string(), z.unknown()).nullable(),
        created_at: z.string()
    })
    .strict()

export const AdminActivityListItemSchema = z
    .object({
        id: z.number().int().positive(),
        created_at: z.string(),
        resource_type: AdminResourceTypeSchema.nullable(),
        resource_id: z.union([z.string(), z.number()]).nullable(),
        actor_name: z.string().optional(),
        activity_key: z.string(),
        reason: z.string().nullable().optional(),
        metadata: z.record(z.string(), z.unknown()).optional()
    })
    .strict()

export const GetActivityLogsResSchema = z
    .object({
        data: z.array(AdminActivityListItemSchema),
        meta: AdminListMetaSchema,
        log_type: z.enum(['admin', 'activity'])
    })
    .strict()

export const DashboardStatsSchema = z
    .object({
        total_users: z.number().int().nonnegative(),
        active_users: z.number().int().nonnegative(),
        banned_users: z.number().int().nonnegative(),
        total_posts: z.number().int().nonnegative(),
        hidden_posts: z.number().int().nonnegative(),
        deleted_posts: z.number().int().nonnegative(),
        total_comments: z.number().int().nonnegative(),
        total_admin_actions: z.number().int().nonnegative(),
        new_users_this_period: z.number().int().nonnegative(),
        new_posts_this_period: z.number().int().nonnegative()
    })
    .strict()

export const GetDashboardStatsResSchema = z
    .object({
        data: DashboardStatsSchema
    })
    .strict()

export type AdminListMeta = z.infer<typeof AdminListMetaSchema>
export type AdminUser = z.infer<typeof AdminUserSchema>
export type GetAdminUsersRes = z.infer<typeof GetAdminUsersResSchema>
export type BanUserRes = z.infer<typeof BanUserResSchema>
export type UnbanUserRes = z.infer<typeof UnbanUserResSchema>
export type DeleteUserRes = z.infer<typeof DeleteUserResSchema>
export type CommonMessageRes = z.infer<typeof CommonMessageResSchema>
export type AdminPost = z.infer<typeof AdminPostSchema>
export type GetAdminPostsRes = z.infer<typeof GetAdminPostsResSchema>
export type HidePostRes = z.infer<typeof HidePostResSchema>
export type UnhidePostRes = z.infer<typeof UnhidePostResSchema>
export type DeletePostRes = z.infer<typeof DeletePostResSchema>
export type AdminComment = z.infer<typeof AdminCommentSchema>
export type GetAdminCommentsRes = z.infer<typeof GetAdminCommentsResSchema>
export type DeleteCommentRes = z.infer<typeof DeleteCommentResSchema>
export type AdminLog = z.infer<typeof AdminLogSchema>
export type ActivityLog = z.infer<typeof ActivityLogSchema>
export type AdminActivityListItem = z.infer<typeof AdminActivityListItemSchema>
export type GetActivityLogsRes = z.infer<typeof GetActivityLogsResSchema>
export type DashboardStats = z.infer<typeof DashboardStatsSchema>
export type GetDashboardStatsRes = z.infer<typeof GetDashboardStatsResSchema>
