import baseQueryWithReauth from '@/store/services/client'
import { createApi } from '@reduxjs/toolkit/query/react'
import {
    CreatePrivateConversationReqType,
    GetConversationsQueryType,
    GetMessagesQueryType,
    MarkConversationAsReadReqType,
    SendMessageReqType
} from '@/types/dtos/chat/chat-request.dto'
import {
    CreatePrivateConversationResType,
    GetConversationsResType,
    GetMessagesResType,
    GetUnreadMessagesCountResType,
    SendMessageResType
} from '@/types/dtos/chat/chat-response.dto'

const defaultConversationsPerPage = 20
const defaultMessagesPerPage = 30

export const ChatApi = createApi({
    reducerPath: 'ChatApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Conversations', 'Messages'],
    refetchOnMountOrArgChange: false,
    keepUnusedDataFor: 60,
    refetchOnFocus: false,
    refetchOnReconnect: true,
    endpoints: (builder) => ({
        getConversations: builder.query<GetConversationsResType, GetConversationsQueryType | void>({
            query: (params) => {
                const page = params?.page ?? 1
                const perPage = params?.per_page ?? defaultConversationsPerPage
                return `/conversations?page=${page}&per_page=${perPage}`
            },
            providesTags: (result) => {
                if (!result) {
                    return [
                        { type: 'Conversations' as const, id: 'LIST' },
                        { type: 'Conversations' as const, id: 'UNREAD' }
                    ]
                }

                return [
                    ...result.data.map((conversation) => ({ type: 'Conversations' as const, id: conversation.id })),
                    { type: 'Conversations' as const, id: 'LIST' },
                    { type: 'Conversations' as const, id: 'UNREAD' }
                ]
            }
        }),
        createPrivateConversation: builder.mutation<CreatePrivateConversationResType, CreatePrivateConversationReqType>(
            {
                query: (payload) => ({
                    url: '/conversations/private',
                    method: 'POST',
                    body: payload
                }),
                invalidatesTags: [{ type: 'Conversations', id: 'LIST' }]
            }
        ),
        getMessages: builder.query<GetMessagesResType, GetMessagesQueryType>({
            query: ({ conversation_id, page = 1, per_page = defaultMessagesPerPage }) =>
                `/conversations/${conversation_id}/messages?page=${page}&per_page=${per_page}`,
            providesTags: (result, error, arg) => {
                void error
                if (!result) {
                    return [{ type: 'Messages' as const, id: `LIST-${arg.conversation_id}` }]
                }

                return [
                    ...result.data.map((message) => ({ type: 'Messages' as const, id: message.id })),
                    { type: 'Messages' as const, id: `LIST-${arg.conversation_id}` }
                ]
            }
        }),
        sendMessage: builder.mutation<SendMessageResType, SendMessageReqType>({
            query: ({ conversation_id, ...body }) => ({
                url: `/conversations/${conversation_id}/messages`,
                method: 'POST',
                body
            }),
            invalidatesTags: (result, error, arg) => {
                void result
                void error
                return [
                    { type: 'Messages' as const, id: `LIST-${arg.conversation_id}` },
                    { type: 'Conversations' as const, id: arg.conversation_id },
                    { type: 'Conversations' as const, id: 'LIST' },
                    { type: 'Conversations' as const, id: 'UNREAD' }
                ]
            }
        }),
        markConversationAsRead: builder.mutation<{ message: string }, MarkConversationAsReadReqType>({
            query: ({ conversation_id }) => ({
                url: `/conversations/${conversation_id}/read`,
                method: 'POST'
            }),
            invalidatesTags: (result, error, arg) => {
                void result
                void error
                return [
                    { type: 'Conversations' as const, id: arg.conversation_id },
                    { type: 'Conversations' as const, id: 'LIST' },
                    { type: 'Conversations' as const, id: 'UNREAD' }
                ]
            }
        }),
        getUnreadMessagesCount: builder.query<GetUnreadMessagesCountResType, void>({
            query: () => '/conversations/unread-count',
            providesTags: [{ type: 'Conversations', id: 'UNREAD' }]
        })
    })
})

export const {
    useGetConversationsQuery,
    useCreatePrivateConversationMutation,
    useGetMessagesQuery,
    useSendMessageMutation,
    useMarkConversationAsReadMutation,
    useGetUnreadMessagesCountQuery
} = ChatApi
