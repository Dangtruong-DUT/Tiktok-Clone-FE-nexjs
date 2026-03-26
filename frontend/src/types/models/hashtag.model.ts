import { z } from 'zod'

export const HashtagSchema = z
    .object({
        id: z.string(),
        name: z.string(),
        created_at: z.string()
    })
    .strict()

export type HashtagType = z.infer<typeof HashtagSchema>
