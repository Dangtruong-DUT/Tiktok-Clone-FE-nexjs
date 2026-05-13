/**
 * Notification domain types.
 * Plain TypeScript — no Zod needed for API response shapes.
 */

export interface NotificationActor {
    readonly id: number
    readonly uuid: string
    readonly name: string
    readonly username: string
    readonly avatar: string | null
    readonly is_followed: boolean
}

export interface NotificationEntity {
    readonly id?: number
    readonly type?: 'post' | 'user' | 'hashtag'
    readonly uuid?: string
    readonly username?: string
    readonly avatar?: string | null
    readonly thumbnail_url?: string | null
    readonly content?: string | null
    readonly name?: string
}

export interface NotificationType {
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
