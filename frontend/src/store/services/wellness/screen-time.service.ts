import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/base/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import type { ScreenTimeStatsType, ScreenTimeDailySeries, StartSessionResponse } from '@/types/models/screen-time.model'
import type { ApiSuccessResponseWithData } from '@/types/common/http-response.type'

export const ScreenTimeApi = createApi({
    reducerPath: 'screenTimeApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['ScreenTime'],
    keepUnusedDataFor: 60,
    endpoints: (builder) => ({
        getStats: builder.query<ApiSuccessResponseWithData<ScreenTimeStatsType>, { period?: string }>({
            query: ({ period = 'today' }) => ({
                url: BACKEND_API_ENDPOINT.WELLNESS.STATS,
                params: { period }
            }),
            providesTags: ['ScreenTime']
        }),

        getHistory: builder.query<
            ApiSuccessResponseWithData<ScreenTimeDailySeries[]>,
            { date_from?: string; date_to?: string }
        >({
            query: (params) => ({ url: BACKEND_API_ENDPOINT.WELLNESS.HISTORY, params })
        }),

        startSession: builder.mutation<ApiSuccessResponseWithData<StartSessionResponse>, void>({
            query: () => ({ url: BACKEND_API_ENDPOINT.WELLNESS.SESSION_START, method: 'POST' })
        }),

        sendHeartbeat: builder.mutation<ApiSuccessResponseWithData<null>, string>({
            query: (uuid) => ({ url: BACKEND_API_ENDPOINT.WELLNESS.HEARTBEAT(uuid), method: 'POST' })
        }),

        updateVideoTime: builder.mutation<
            ApiSuccessResponseWithData<{ video_seconds: number }>,
            { uuid: string; video_seconds: number }
        >({
            query: ({ uuid, video_seconds }) => ({
                url: BACKEND_API_ENDPOINT.WELLNESS.VIDEO_TIME(uuid),
                method: 'POST',
                body: { video_seconds }
            })
        }),

        endSession: builder.mutation<ApiSuccessResponseWithData<null>, { uuid: string; duration_seconds: number }>({
            query: ({ uuid, duration_seconds }) => ({
                url: BACKEND_API_ENDPOINT.WELLNESS.SESSION_END(uuid),
                method: 'POST',
                body: { duration_seconds }
            }),
            invalidatesTags: ['ScreenTime']
        })
    })
})

export const {
    useGetStatsQuery,
    useGetHistoryQuery,
    useStartSessionMutation,
    useSendHeartbeatMutation,
    useUpdateVideoTimeMutation,
    useEndSessionMutation
} = ScreenTimeApi
