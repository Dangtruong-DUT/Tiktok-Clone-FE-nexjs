import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import type { AiCopilotSession, AiCopilotSessionContext } from '@/types/models/ai-copilot.model'
import type { ApiSuccessResponseWithData } from '@/types/common/http-response.type'

export interface StartSessionPayload {
    upload_session_uuid?: string
    post_uuid?: string
    post_id?: number
    video_size_bytes?: number
    locale?: string
    context_snapshot?: AiCopilotSessionContext
}

export interface SendMessagePayload {
    sessionUuid: string
    content: string
    attachments?: {
        timeline?: { start_seconds: number; end_seconds: number }
        frames?: string[]
    }
}

export interface SendMessageResponse {
    success: boolean
    streaming: boolean
    // Non-streaming path
    data?: import('@/types/models/ai-copilot.model').AiCopilotMessage
    // Streaming path
    message_uuid?: string
    stream_token?: string
    stream_url?: string
}

export const AiCopilotApi = createApi({
    reducerPath:       'aiCopilotApi',
    baseQuery:         baseQueryWithReauth,
    tagTypes:          ['AiCopilotSession'],
    keepUnusedDataFor: 300,
    endpoints: (builder) => ({
        startSession: builder.mutation<ApiSuccessResponseWithData<AiCopilotSession>, StartSessionPayload>({
            query: (body) => ({
                url:    BACKEND_API_ENDPOINT.AI_COPILOT.SESSIONS,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['AiCopilotSession'],
        }),

        getSession: builder.query<ApiSuccessResponseWithData<AiCopilotSession>, string>({
            query: (uuid) => BACKEND_API_ENDPOINT.AI_COPILOT.SESSION(uuid),
            providesTags: (_r, _e, uuid) => [{ type: 'AiCopilotSession', id: uuid }],
        }),

        sendMessage: builder.mutation<SendMessageResponse, SendMessagePayload>({
            query: ({ sessionUuid, ...body }) => ({
                url:    BACKEND_API_ENDPOINT.AI_COPILOT.MESSAGES(sessionUuid),
                method: 'POST',
                body,
            }),
        }),

        acceptMessage: builder.mutation<void, { messageUuid: string; field: string }>({
            query: ({ messageUuid, field }) => ({
                url:    BACKEND_API_ENDPOINT.AI_COPILOT.ACCEPT(messageUuid),
                method: 'POST',
                body:   { field },
            }),
        }),

        rejectMessage: builder.mutation<void, string>({
            query: (messageUuid) => ({
                url:    BACKEND_API_ENDPOINT.AI_COPILOT.REJECT(messageUuid),
                method: 'POST',
            }),
        }),

        deleteSession: builder.mutation<void, string>({
            query: (uuid) => ({
                url:    BACKEND_API_ENDPOINT.AI_COPILOT.DELETE_SESSION(uuid),
                method: 'DELETE',
            }),
            invalidatesTags: ['AiCopilotSession'],
        }),
    }),
})

export const {
    useStartSessionMutation,
    useGetSessionQuery,
    useSendMessageMutation,
    useAcceptMessageMutation,
    useRejectMessageMutation,
    useDeleteSessionMutation,
} = AiCopilotApi
