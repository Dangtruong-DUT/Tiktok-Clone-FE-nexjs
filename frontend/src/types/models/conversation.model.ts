import { z } from 'zod'

export const ConversationSchema = z
    .object({
        id: z.number(),
        type: z.number(),
        type_key: z.string(),
        unread_count: z.number(),
        created_at: z.string().nullable(),
        updated_at: z.string().nullable(),
        participants: z.array(
            z.object({
                id: z.number(),
                uuid: z.string(),
                username: z.string(),
                name: z.string(),
                avatar: z.string().nullable(),
                last_read_at: z.string().nullable()
            })
        ),
        last_message: z
            .object({
                id: z.number(),
                conversation_id: z.number(),
                sender_id: z.number().nullable(),
                content: z.string(),
                type: z.number(),
                type_key: z.string(),
                reply_to_id: z.number().nullable(),
                created_at: z.string().nullable(),
                updated_at: z.string().nullable()
            })
            .nullable()
    })
    .strict()

export type ConversationType = z.infer<typeof ConversationSchema>
