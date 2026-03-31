export type NotificationTabType = 'all' | 'likes' | 'comments' | 'mentions' | 'followers'

export type GetListNotificationQueryType = {
    tab: NotificationTabType
}
