import { z } from 'zod'

export const FollowerSchema = z
    .object({
        id: z.string(),
        followed_user_id: z.string(),
        user_id: z.string(),
        created_at: z.string()
    })
    .strict()

export type FollowerType = z.infer<typeof FollowerSchema>
