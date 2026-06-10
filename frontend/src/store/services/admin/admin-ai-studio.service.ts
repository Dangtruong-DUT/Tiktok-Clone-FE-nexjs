import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import type {
    GetAiMetricsQueryDto,
    ListAiRequestsQueryDto,
    UpdateAiStudioSettingsReqBodyDto
} from '@/types/dtos/admin/ai/admin-ai-studio.request.dto'
import type {
    GetAiMetricsResDto,
    GetAiSettingsResDto,
    ListAiRequestsResDto,
    GetAiAvailableModelsResDto
} from '@/types/dtos/admin/ai/admin-ai-studio.response.dto'

export const AdminAiStudioApi = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ['AiStudioSettings', 'AiStudioMetrics', 'AiStudioRequests', 'AiStudioModels'],
    reducerPath: 'adminAiStudioApi',
    keepUnusedDataFor: 60,
    endpoints: (builder) => ({
        getAiMetrics: builder.query<GetAiMetricsResDto, GetAiMetricsQueryDto>({
            query: ({ period = 'today' }) => ({
                url: BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.METRICS,
                params: { period }
            }),
            providesTags: ['AiStudioMetrics']
        }),

        getAiSettings: builder.query<GetAiSettingsResDto, void>({
            query: () => BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.SETTINGS,
            providesTags: ['AiStudioSettings']
        }),

        updateAiSettings: builder.mutation<GetAiSettingsResDto, UpdateAiStudioSettingsReqBodyDto>({
            query: (body) => ({
                url: BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.SETTINGS,
                method: 'PUT',
                body
            }),
            invalidatesTags: ['AiStudioSettings']
        }),

        listAiRequests: builder.query<ListAiRequestsResDto, ListAiRequestsQueryDto>({
            query: (params) => ({
                url: BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.REQUESTS,
                params
            }),
            providesTags: ['AiStudioRequests']
        }),

        getAvailableModels: builder.query<GetAiAvailableModelsResDto, void>({
            query: () => BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.MODELS,
            providesTags: ['AiStudioModels'],
            keepUnusedDataFor: 3600
        })
    })
})

export const {
    useGetAiMetricsQuery,
    useGetAiSettingsQuery,
    useUpdateAiSettingsMutation,
    useListAiRequestsQuery,
    useGetAvailableModelsQuery
} = AdminAiStudioApi
