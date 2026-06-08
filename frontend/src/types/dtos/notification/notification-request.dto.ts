export const NOTIFICATION_TABS = {
    ALL: 'all',
    LIKES: 'likes',
    COMMENTS: 'comments',
    MENTIONS: 'mentions',
    FOLLOWERS: 'followers'
} as const

export type NotificationTabType = (typeof NOTIFICATION_TABS)[keyof typeof NOTIFICATION_TABS]

export interface GetListNotificationQueryType {
    readonly tab: NotificationTabType
}
