import { z } from 'zod'
import { AppealResourceTypeSchema, AppealStatusSchema, AppealTypeSchema } from '@/types/models/appeal.model'

export const CreateAppealRequestSchema = z
    .object({
        appeal_type: AppealTypeSchema,
        resource_id: z.number().int().positive().nullable().optional(),
        resource_type: AppealResourceTypeSchema,
        reason: z.string().min(20).max(1000)
    })
    .strict()

export const GetMyAppealsParamsSchema = z
    .object({
        page: z.number().int().positive().optional(),
        per_page: z.number().int().positive().optional(),
        appeal_status: AppealStatusSchema.optional(),
        appeal_type: AppealTypeSchema.optional(),
        order_by: z.array(z.enum(['created_at', '-created_at'])).optional()
    })
    .strict()

export type CreateAppealRequest = z.infer<typeof CreateAppealRequestSchema>
export type GetMyAppealsParams = z.infer<typeof GetMyAppealsParamsSchema>
