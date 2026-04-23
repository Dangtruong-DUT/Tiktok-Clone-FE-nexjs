import { z } from 'zod'
import type { ApiSuccessResponse } from '@/types/common/http-response.type'
import { AppealTypeSchema, AppealStatusSchema, AppealResourceTypeSchema } from '@/types/models/appeal.model'

/** Response from GET /appeals/verify-token */
export const AppealTokenInfoSchema = z.object({
    uuid: z.string(),
    appeal_type: AppealTypeSchema,
    resource_type: AppealResourceTypeSchema,
    resource_id: z.number().int().positive().nullable(),
    status: AppealStatusSchema,
    expires_at: z.string().nullable()
})

export type AppealTokenInfo = z.infer<typeof AppealTokenInfoSchema>
export type VerifyAppealTokenResponse = ApiSuccessResponse & { data: AppealTokenInfo }

/** Request body for POST /appeals/submit-evidence (multipart/form-data) */
export type SubmitAppealEvidenceRequest = {
    token: string
    reason: string
    evidence_files?: File[]
}

/** Response from POST /appeals/submit-evidence */
export type SubmitAppealEvidenceResponse = ApiSuccessResponse & {
    data: {
        uuid: string
        status: string
    }
}
