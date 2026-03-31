import baseQueryWithReauth from '@/store/services/client'
import {
    GetListNotificationResType,
    GetUnreadCountNotificationResType,
    MarkAllNotificationAsReadResType
} from '@/types/dtos/notification/notification-response.dto'
import { GetListNotificationQueryType } from '@/types/dtos/notification/notification-request.dto'
import { createApi } from '@reduxjs/toolkit/query/react'

export const NotificationApi = createApi({
    reducerPath: 'NotificationApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Notifications'],
    refetchOnMountOrArgChange: false,
    keepUnusedDataFor: 30,
    refetchOnFocus: false,
    refetchOnReconnect: true,
    endpoints: (builder) => ({
        getNotifications: builder.infiniteQuery<GetListNotificationResType, GetListNotificationQueryType, number>({
            query: ({ pageParam, queryArg }) => `/notifications?tab=${queryArg.tab}&page=${pageParam}&per_page=20`,
            providesTags: (result, error, arg) => {
                void error

                if (result) {
                    return [
                        ...result.pages.flatMap((page) =>
                            page.data.map((notification) => ({ type: 'Notifications' as const, id: notification.uuid }))
                        ),
                        { type: 'Notifications' as const, id: `LIST-${arg.tab}` },
                        { type: 'Notifications' as const, id: `UNREAD-${arg.tab}` },
                        { type: 'Notifications' as const, id: 'UNREAD-all' }
                    ]
                }

                return [
                    { type: 'Notifications' as const, id: `LIST-${arg.tab}` },
                    { type: 'Notifications' as const, id: `UNREAD-${arg.tab}` },
                    { type: 'Notifications' as const, id: 'UNREAD-all' }
                ]
            },
            infiniteQueryOptions: {
                initialPageParam: 1,
                maxPages: 10,
                getNextPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page, last_page } = meta
                    if (current_page >= last_page) return undefined
                    return current_page + 1
                },
                getPreviousPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page } = meta
                    if (current_page <= 1) return undefined
                    return current_page - 1
                }
            }
        }),
        getUnreadCount: builder.query<GetUnreadCountNotificationResType, GetListNotificationQueryType | void>({
            query: (params) => {
                const tab = params?.tab ?? 'all'
                return `/notifications/unread-count?tab=${tab}`
            },
            providesTags: (result, error, arg) => {
                void result
                void error
                const tab = arg?.tab ?? 'all'
                return [{ type: 'Notifications' as const, id: `UNREAD-${tab}` }]
            }
        }),
        markAsRead: builder.mutation<{ message: string }, string>({
            query: (notificationUuid) => ({
                url: `/notifications/${notificationUuid}/read`,
                method: 'POST'
            }),
            invalidatesTags: (result, error, notificationUuid) => {
                void result
                void error
                return [
                    { type: 'Notifications' as const, id: notificationUuid },
                    { type: 'Notifications' as const, id: 'UNREAD-all' },
                    { type: 'Notifications' as const, id: 'UNREAD-likes' },
                    { type: 'Notifications' as const, id: 'UNREAD-comments' },
                    { type: 'Notifications' as const, id: 'UNREAD-mentions' },
                    { type: 'Notifications' as const, id: 'UNREAD-followers' }
                ]
            }
        }),
        markAllAsRead: builder.mutation<MarkAllNotificationAsReadResType, GetListNotificationQueryType | void>({
            query: (params) => ({
                url: '/notifications/mark-all-read',
                method: 'POST',
                body: {
                    tab: params?.tab ?? 'all'
                }
            }),
            invalidatesTags: (result, error, arg) => {
                void result
                void error
                const tab = arg?.tab ?? 'all'

                return [
                    { type: 'Notifications' as const, id: `LIST-${tab}` },
                    { type: 'Notifications' as const, id: 'LIST-all' },
                    { type: 'Notifications' as const, id: 'UNREAD-all' },
                    { type: 'Notifications' as const, id: 'UNREAD-likes' },
                    { type: 'Notifications' as const, id: 'UNREAD-comments' },
                    { type: 'Notifications' as const, id: 'UNREAD-mentions' },
                    { type: 'Notifications' as const, id: 'UNREAD-followers' }
                ]
            }
        })
    })
})

export const {
    useGetNotificationsInfiniteQuery,
    useGetUnreadCountQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation
} = NotificationApi
