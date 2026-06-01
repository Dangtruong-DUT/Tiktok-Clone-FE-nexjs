import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import {
    AiContentSuggestionType,
    AiStudioMetricsType,
    AiStudioSettingType
} from '@/types/models/ai-content-suggestion.model'
import { UpdateAiStudioSettingsReqBodyType } from '@/types/dtos/ai/ai-content-suggestion.dto'
import { ApiSuccessResponseWithData, ApiSuccessResponseWithMeta } from '@/types/common/http-response.type'

interface AiRequestFilters {
    status?: string
    user_uuid?: string
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
}

export const AdminAiStudioApi = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ['AiStudioSettings', 'AiStudioMetrics', 'AiStudioRequests'],
    reducerPath: 'adminAiStudioApi',
    keepUnusedDataFor: 60,
    endpoints: (builder) => ({
        getAiMetrics: builder.query<ApiSuccessResponseWithData<AiStudioMetricsType>, { period?: string }>({
            query: ({ period = 'today' }) => ({
                url: BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.METRICS,
                params: { period }
            }),
            providesTags: ['AiStudioMetrics']
        }),

        getAiSettings: builder.query<ApiSuccessResponseWithData<AiStudioSettingType>, void>({
            query: () => BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.SETTINGS,
            providesTags: ['AiStudioSettings']
        }),

        updateAiSettings: builder.mutation<
            ApiSuccessResponseWithData<AiStudioSettingType>,
            UpdateAiStudioSettingsReqBodyType
        >({
            query: (body) => ({
                url: BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.SETTINGS,
                method: 'PUT',
                body
            }),
            invalidatesTags: ['AiStudioSettings']
        }),

        listAiRequests: builder.query<ApiSuccessResponseWithMeta<AiContentSuggestionType[]>, AiRequestFilters>({
            query: (params) => ({
                url: BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.REQUESTS,
                params
            }),
            providesTags: ['AiStudioRequests']
        })
    })
})

export const { useGetAiMetricsQuery, useGetAiSettingsQuery, useUpdateAiSettingsMutation, useListAiRequestsQuery } =
    AdminAiStudioApi
