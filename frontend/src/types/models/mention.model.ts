import { z } from 'zod'

export const MentionSchema = z
    .object({
        id: z.number(),
        username: z.string(),
        start: z.number().int().nonnegative().nullable().optional(),
        end: z.number().int().nonnegative().nullable().optional()
    })
    .strict()

export type MentionType = z.infer<typeof MentionSchema>
