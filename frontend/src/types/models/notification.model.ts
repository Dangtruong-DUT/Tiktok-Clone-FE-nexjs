/**
 * Notification domain types.
 * Plain TypeScript — no Zod needed for API response shapes.
 */

export type NotificationActor = {
    readonly id: number
    readonly uuid: string
    readonly name: string
    readonly username: string
    readonly avatar: string | null
    readonly is_followed: boolean
}

export type NotificationEntity = {
    readonly id?: number
    readonly type?: 'post' | 'user' | 'hashtag'
    readonly uuid?: string
    readonly username?: string
    readonly avatar?: string | null
    readonly thumbnail_url?: string | null
    readonly content?: string | null
    readonly name?: string
}

export type NotificationType = {
    readonly id: number
    readonly uuid: string
    readonly type: number
    readonly type_key: string
    readonly is_read: boolean
    readonly data?: Record<string, unknown> | null
    readonly created_at: string
    readonly actor?: NotificationActor | null
    readonly entity?: NotificationEntity | null
}

/** @deprecated use NotificationActor */
export type NotificationActorType = NotificationActor

/** @deprecated use NotificationEntity */
export type NotificationEntityType = NotificationEntity
