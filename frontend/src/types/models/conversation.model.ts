import { z } from 'zod'

export const ConversationSchema = z
    .object({
        id: z.string(),
        sender_id: z.string(),
        receiver_id: z.string(),
        content: z.string(),
        created_at: z.string(),
        update_at: z.string()
    })
    .strict()

export type ConversationType = z.infer<typeof ConversationSchema>
