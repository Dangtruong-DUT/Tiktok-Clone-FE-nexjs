import { z } from 'zod'

export const NotificationActorSchema = z
    .object({
        id: z.number(),
        uuid: z.string(),
        name: z.string(),
        username: z.string(),
        avatar: z.string().nullable().optional(),
        is_followed: z.boolean()
    })
    .strict()

export const NotificationEntitySchema = z
    .object({
        id: z.number().optional(),
        type: z.enum(['post', 'user', 'hashtag']).optional(),
        uuid: z.string().optional(),
        username: z.string().optional(),
        avatar: z.string().nullable().optional(),
        thumbnail_url: z.string().nullable().optional(),
        content: z.string().nullable().optional(),
        name: z.string().optional()
    })
    .strict()

export const NotificationSchema = z
    .object({
        id: z.number(),
        uuid: z.string(),
        type: z.number(),
        type_key: z.string(),
        is_read: z.boolean(),
        data: z.record(z.string(), z.any()).nullable().optional(),
        created_at: z.string(),
        actor: NotificationActorSchema.nullable().optional(),
        entity: NotificationEntitySchema.nullable().optional()
    })
    .strict()

export type NotificationActorType = z.infer<typeof NotificationActorSchema>
export type NotificationEntityType = z.infer<typeof NotificationEntitySchema>
export type NotificationType = z.infer<typeof NotificationSchema>
