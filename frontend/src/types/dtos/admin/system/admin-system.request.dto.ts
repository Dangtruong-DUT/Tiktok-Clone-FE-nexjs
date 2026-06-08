import { z } from 'zod'
import { AdminResourceTypeSchema } from '../common/admin-common.request.dto'

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
        admin_uuid: z.string().optional(),
        user_uuid: z.string().optional(),
        resource_type: AdminResourceTypeSchema.optional(),
        date_from: z.string().optional(),
        date_to: z.string().optional(),
        order_by: z.array(z.enum(['id', 'created_at', '-id', '-created_at'])).optional()
    })
    .strict()

export type GetDashboardStatsParams = z.infer<typeof GetDashboardStatsParamsSchema>
export type GetActivityLogsParams = z.infer<typeof GetActivityLogsParamsSchema>
