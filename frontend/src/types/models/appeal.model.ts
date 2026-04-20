import { z } from 'zod'
import { APPEAL_RESOURCE_TYPE_VALUES, APPEAL_STATUS_VALUES, APPEAL_TYPE_VALUES } from '@/constants/appeal.const'

export const AppealTypeSchema = z.enum(APPEAL_TYPE_VALUES)
export const AppealStatusSchema = z.enum(APPEAL_STATUS_VALUES)
export const AppealResourceTypeSchema = z.enum(APPEAL_RESOURCE_TYPE_VALUES)

export const AppealSchema = z
    .object({
        id: z.number().int().positive(),
        uuid: z.string().nullable().optional(),
        user_id: z.number().int().positive(),
        appeal_type: AppealTypeSchema,
        resource_id: z.number().int().positive().nullable(),
        resource_type: AppealResourceTypeSchema,
        reason: z.string(),
        status: AppealStatusSchema,
        admin_response: z.string().nullable(),
        reviewed_by: z.number().int().positive().nullable(),
        reviewed_at: z.string().nullable(),
        created_at: z.string(),
        updated_at: z.string()
    })
    .strict()

export type Appeal = z.infer<typeof AppealSchema>
