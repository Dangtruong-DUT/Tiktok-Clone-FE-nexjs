import { z } from 'zod'

export const LikeSchema = z
    .object({
        id: z.string(),
        user_id: z.string(),
        post_id: z.string(),
        created_at: z.string()
    })
    .strict()

export type LikesType = z.infer<typeof LikeSchema>
