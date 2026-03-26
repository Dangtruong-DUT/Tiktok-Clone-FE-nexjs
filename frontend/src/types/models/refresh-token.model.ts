import { z } from 'zod'

export const RefreshTokenSchema = z
    .object({
        id: z.string(),
        token: z.string(),
        user_id: z.string(),
        created_at: z.string()
    })
    .strict()

export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>
