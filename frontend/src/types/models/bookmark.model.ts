import { z } from 'zod'

export const BookmarkSchema = z
    .object({
        id: z.string(),
        user_id: z.string(),
        post_id: z.string(),
        created_at: z.string()
    })
    .strict()

export type BookmarksType = z.infer<typeof BookmarkSchema>
