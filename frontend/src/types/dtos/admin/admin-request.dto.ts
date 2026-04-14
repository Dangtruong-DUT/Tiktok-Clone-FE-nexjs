import { z } from 'zod'

export const AdminResourceTypeSchema = z.enum(['user', 'post', 'comment', 'message', 'appeal'])

export const GetAdminUsersParamsSchema = z
    .object({
        page: z.number().int().positive().optional(),
        per_page: z.number().int().positive().optional(),
        search: z.string().optional(),
        status: z.enum(['active', 'banned', 'all']).optional(),
        sort_by: z
            .enum(['id', 'username', 'email', 'created_at', '-id', '-username', '-email', '-created_at'])
            .optional()
    })
    .strict()

export const BanUserReqSchema = z
    .object({
        user_id: z.number().int().positive(),
        reason: z.string(),
        duration_days: z.number().int().positive().optional()
    })
    .strict()

export const UnbanUserReqSchema = z
    .object({
        user_id: z.number().int().positive()
    })
    .strict()

export const DeleteUserReqSchema = z
    .object({
        user_id: z.number().int().positive(),
        reason: z.string()
    })
    .strict()

export const ResetUserPasswordReqSchema = z
    .object({
        user_id: z.number().int().positive(),
        password: z.string().min(8).max(100),
        password_confirmation: z.string().min(8).max(100)
    })
    .strict()

export const SendUserMailReqSchema = z
    .object({
        user_id: z.number().int().positive(),
        subject: z.string().min(3).max(150),
        message: z.string().min(10).max(5000)
    })
    .strict()

export const GetAdminPostsParamsSchema = z
    .object({
        page: z.number().int().positive().optional(),
        per_page: z.number().int().positive().optional(),
        search: z.string().optional(),
        user_id: z.number().int().positive().optional(),
        status: z.enum(['all', 'visible', 'hidden', 'deleted']).optional(),
        date_from: z.string().optional(),
        date_to: z.string().optional(),
        sort_by: z.enum(['id', 'created_at', 'likes_count', '-id', '-created_at', '-likes_count']).optional()
    })
    .strict()

export const HidePostReqSchema = z
    .object({
        post_uuid: z.string(),
        reason: z.string()
    })
    .strict()

export const UnhidePostReqSchema = z
    .object({
        post_uuid: z.string()
    })
    .strict()

export const DeletePostReqSchema = z
    .object({
        post_uuid: z.string(),
        reason: z.string()
    })
    .strict()

export const GetAdminCommentsParamsSchema = z
    .object({
        page: z.number().int().positive().optional(),
        per_page: z.number().int().positive().optional(),
        search: z.string().optional(),
        post_uuid: z.string().optional(),
        user_id: z.number().int().positive().optional(),
        date_from: z.string().optional(),
        date_to: z.string().optional(),
        sort_by: z.enum(['id', 'created_at', 'likes_count', '-id', '-created_at', '-likes_count']).optional()
    })
    .strict()

export const DeleteCommentReqSchema = z
    .object({
        comment_id: z.number().int().positive(),
        reason: z.string()
    })
    .strict()

export const DashboardPeriodSchema = z.enum(['today', 'week', 'month', 'year'])

export const GetDashboardStatsParamsSchema = z
    .object({
        period: DashboardPeriodSchema.optional()
    })
    .strict()

export const GetActivityLogsParamsSchema = z
    .object({
        page: z.number().int().positive().optional(),
        per_page: z.number().int().positive().optional(),
        log_type: z.enum(['admin', 'activity']).optional(),
        action_type: z.string().optional(),
        admin_id: z.number().int().positive().optional(),
        user_id: z.number().int().positive().optional(),
        resource_type: AdminResourceTypeSchema.optional(),
        date_from: z.string().optional(),
        date_to: z.string().optional(),
        sort_by: z.enum(['id', 'created_at', '-id', '-created_at']).optional()
    })
    .strict()

export type AdminResourceType = z.infer<typeof AdminResourceTypeSchema>
export type GetAdminUsersParams = z.infer<typeof GetAdminUsersParamsSchema>
export type BanUserReq = z.infer<typeof BanUserReqSchema>
export type UnbanUserReq = z.infer<typeof UnbanUserReqSchema>
export type DeleteUserReq = z.infer<typeof DeleteUserReqSchema>
export type ResetUserPasswordReq = z.infer<typeof ResetUserPasswordReqSchema>
export type SendUserMailReq = z.infer<typeof SendUserMailReqSchema>
export type GetAdminPostsParams = z.infer<typeof GetAdminPostsParamsSchema>
export type HidePostReq = z.infer<typeof HidePostReqSchema>
export type UnhidePostReq = z.infer<typeof UnhidePostReqSchema>
export type DeletePostReq = z.infer<typeof DeletePostReqSchema>
export type GetAdminCommentsParams = z.infer<typeof GetAdminCommentsParamsSchema>
export type DeleteCommentReq = z.infer<typeof DeleteCommentReqSchema>
export type GetDashboardStatsParams = z.infer<typeof GetDashboardStatsParamsSchema>
export type GetActivityLogsParams = z.infer<typeof GetActivityLogsParamsSchema>
