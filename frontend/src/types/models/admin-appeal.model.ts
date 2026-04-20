import { z } from 'zod'
import { AppealSchema } from '@/types/models/appeal.model'

const AppealUserSummarySchema = z
    .object({
        id: z.number().int().positive(),
        uuid: z.string(),
        username: z.string(),
        email: z.string().email().nullable().optional(),
        avatar: z.string().nullable().optional()
    })
    .strict()

export const AdminAppealSchema = AppealSchema.extend({
    user: AppealUserSummarySchema.nullable().optional(),
    reviewer: AppealUserSummarySchema.nullable().optional()
}).strict()

export type AdminAppeal = z.infer<typeof AdminAppealSchema>
