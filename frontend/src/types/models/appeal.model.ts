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
        reason: z.string().nullable(),
        status: AppealStatusSchema,
        admin_response: z.string().nullable(),
        evidence_files: z
            .array(
                z.object({
                    id: z.number().int().positive(),
                    url: z.string(),
                    file_name: z.string()
                })
            )
            .nullable()
            .optional(),
        reviewed_at: z.string().nullable(),
        appeal_token_expires_at: z.string().nullable().optional(),
        created_at: z.string(),
        updated_at: z.string()
    })
    .passthrough()

export type Appeal = z.infer<typeof AppealSchema>
