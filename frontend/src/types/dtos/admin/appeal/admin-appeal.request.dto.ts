import { z } from 'zod'
import { AppealStatusSchema, AppealTypeSchema } from '@/types/models/appeal.model'

export const GetAdminAppealsParamsSchema = z
    .object({
        page: z.number().int().positive().optional(),
        per_page: z.number().int().positive().optional(),
        appeal_status: AppealStatusSchema.optional(),
        appeal_type: AppealTypeSchema.optional(),
        order_by: z.array(z.enum(['created_at', '-created_at'])).optional()
    })
    .strict()

export const ApproveAppealRequestSchema = z
    .object({
        appeal_uuid: z.string(),
        admin_response: z.string().max(500).optional()
    })
    .strict()

export const RejectAppealRequestSchema = z
    .object({
        appeal_uuid: z.string(),
        admin_response: z.string().min(10).max(500)
    })
    .strict()

export type GetAdminAppealsParams = z.infer<typeof GetAdminAppealsParamsSchema>
export type ApproveAppealRequest = z.infer<typeof ApproveAppealRequestSchema>
export type RejectAppealRequest = z.infer<typeof RejectAppealRequestSchema>
