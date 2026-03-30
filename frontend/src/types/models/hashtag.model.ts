import { z } from 'zod'

export const HashtagSchema = z
    .object({
        id: z.number(),
        uuid: z.string().optional(),
        name: z.string(),
        created_at: z.string().optional(),
        start: z.number().int().nonnegative().nullable().optional(),
        end: z.number().int().nonnegative().nullable().optional()
    })
    .strict()

export type HashtagType = z.infer<typeof HashtagSchema>
