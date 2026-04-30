import { z } from 'zod'
import { AppealResourceTypeSchema, AppealStatusSchema, AppealTypeSchema } from '@/types/models/appeal.model'

/** Token-based appeal creation (public — submit evidence via token) */
export const CreateAppealWithTokenSchema = z
    .object({
        token: z.string().min(32).max(128),
        reason: z.string().min(20).max(1000),
        evidence_files: z.array(z.instanceof(File)).max(5).optional()
    })
    .strict()

/** Auth-based appeal creation (authenticated — create new appeal) */
export const CreateAppealWithAuthSchema = z
    .object({
        appeal_type: AppealTypeSchema,
        resource_id: z.number().int().positive().nullable().optional(),
        resource_type: AppealResourceTypeSchema,
        reason: z.string().min(20).max(1000),
        evidence_files: z.array(z.instanceof(File)).max(5).optional()
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

export type CreateAppealWithTokenRequest = z.infer<typeof CreateAppealWithTokenSchema>
export type CreateAppealWithAuthRequest = z.infer<typeof CreateAppealWithAuthSchema>
export type CreateAppealRequest = CreateAppealWithTokenRequest | CreateAppealWithAuthRequest
export type GetMyAppealsParams = z.infer<typeof GetMyAppealsParamsSchema>
