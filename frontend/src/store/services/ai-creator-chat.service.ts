import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import type { AiCreatorConversationType } from '@/types/models/ai-creator-conversation.model'
import type { ApiSuccessResponseWithData } from '@/types/common/http-response.type'

const CREATOR_CHAT_POLL_INTERVAL_MS = 2_000

export const AiCreatorChatApi = createApi({
    reducerPath:       'aiCreatorChatApi',
    baseQuery:         baseQueryWithReauth,
    tagTypes:          ['AiCreatorConversation'],
    keepUnusedDataFor: 60,
    endpoints: (builder) => ({
        startConversation: builder.mutation<ApiSuccessResponseWithData<AiCreatorConversationType>, void>({
            query: () => ({
                url:    BACKEND_API_ENDPOINT.AI_STUDIO.CREATOR_CHAT.START,
                method: 'POST',
            }),
            invalidatesTags: ['AiCreatorConversation'],
        }),

        getConversation: builder.query<ApiSuccessResponseWithData<AiCreatorConversationType>, string>({
            query: (uuid) => BACKEND_API_ENDPOINT.AI_STUDIO.CREATOR_CHAT.BY_UUID(uuid),
            providesTags: (_result, _error, uuid) => [{ type: 'AiCreatorConversation', id: uuid }],
        }),

        answerStep: builder.mutation<
            ApiSuccessResponseWithData<AiCreatorConversationType>,
            { uuid: string; answer: string }
        >({
            query: ({ uuid, answer }) => ({
                url:    BACKEND_API_ENDPOINT.AI_STUDIO.CREATOR_CHAT.ANSWER(uuid),
                method: 'POST',
                body:   { answer },
            }),
            invalidatesTags: (_result, _error, { uuid }) => [{ type: 'AiCreatorConversation', id: uuid }],
        }),

        skipStep: builder.mutation<ApiSuccessResponseWithData<AiCreatorConversationType>, string>({
            query: (uuid) => ({
                url:    BACKEND_API_ENDPOINT.AI_STUDIO.CREATOR_CHAT.SKIP(uuid),
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, uuid) => [{ type: 'AiCreatorConversation', id: uuid }],
        }),

        generateContent: builder.mutation<ApiSuccessResponseWithData<AiCreatorConversationType>, string>({
            query: (uuid) => ({
                url:    BACKEND_API_ENDPOINT.AI_STUDIO.CREATOR_CHAT.GENERATE(uuid),
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, uuid) => [{ type: 'AiCreatorConversation', id: uuid }],
        }),

        pollConversation: builder.query<ApiSuccessResponseWithData<AiCreatorConversationType>, string>({
            query: (uuid) => BACKEND_API_ENDPOINT.AI_STUDIO.CREATOR_CHAT.BY_UUID(uuid),
            providesTags: (_result, _error, uuid) => [{ type: 'AiCreatorConversation', id: `poll-${uuid}` }],
        }),
    }),
})

export const {
    useStartConversationMutation,
    useGetConversationQuery,
    useAnswerStepMutation,
    useSkipStepMutation,
    useGenerateContentMutation,
    usePollConversationQuery,
} = AiCreatorChatApi

export { CREATOR_CHAT_POLL_INTERVAL_MS }
