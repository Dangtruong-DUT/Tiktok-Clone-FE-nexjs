import { z } from 'zod'

export const MessageSchema = z
    .object({
        id: z.number(),
        conversation_id: z.number(),
        sender_id: z.number().nullable(),
        content: z.string(),
        type: z.number(),
        type_key: z.string(),
        reply_to_id: z.number().nullable(),
        created_at: z.string().nullable(),
        updated_at: z.string().nullable(),
        sender: z
            .object({
                id: z.number(),
                uuid: z.string(),
                username: z.string(),
                name: z.string(),
                avatar: z.string().nullable()
            })
            .nullable(),
        medias: z.array(
            z.object({
                id: z.number(),
                type: z.number().nullable(),
                type_key: z.string().nullable(),
                order: z.number(),
                file: z.object({
                    id: z.number().nullable(),
                    uuid: z.string().nullable(),
                    url: z.string().nullable(),
                    file_name: z.string().nullable(),
                    mime_type: z.string().nullable(),
                    file_size: z.number().nullable()
                })
            })
        ),
        reply_to: z
            .object({
                id: z.number(),
                content: z.string(),
                sender_id: z.number().nullable()
            })
            .nullable()
    })
    .strict()

export type MessageType = z.infer<typeof MessageSchema>
