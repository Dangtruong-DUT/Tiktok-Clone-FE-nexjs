import { z } from 'zod'

export const MentionSchema = z
    .object({
        id: z.number(),
        name: z.string(),
        username: z.string(),
        email: z.string()
    })
    .strict()

export type MentionType = z.infer<typeof MentionSchema>
