import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/base/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import type {
    GetCopilotMetricsQueryDto,
    GetCopilotSessionsQueryDto,
    UpdateFeatureFlagsReqBodyDto,
    UpdatePromptTemplateMutationDto
} from '@/types/dtos/admin/ai/admin-ai-copilot.request.dto'
import type {
    GetCopilotMetricsResDto,
    GetCopilotSessionsResDto,
    ListPromptTemplatesResDto,
    UpdateFeatureFlagsResDto,
    UpdatePromptTemplateResDto
} from '@/types/dtos/admin/ai/admin-ai-copilot.response.dto'

export const AdminAiCopilotApi = createApi({
    reducerPath: 'adminAiCopilotApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['AiPromptTemplate', 'AiCopilotSettings'],
    keepUnusedDataFor: 60,
    endpoints: (builder) => ({
        getCopilotMetrics: builder.query<GetCopilotMetricsResDto, GetCopilotMetricsQueryDto>({
            query: ({ period = 'today' }) => `${BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.COPILOT_METRICS}?period=${period}`
        }),

        getCopilotSessions: builder.query<GetCopilotSessionsResDto, GetCopilotSessionsQueryDto>({
            query: ({ page = 1, perPage = 20 }) =>
                `${BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.COPILOT_SESSIONS}?page=${page}&per_page=${perPage}`
        }),

        listPromptTemplates: builder.query<ListPromptTemplatesResDto, void>({
            query: () => BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.PROMPT_TEMPLATES,
            providesTags: ['AiPromptTemplate']
        }),

        updatePromptTemplate: builder.mutation<UpdatePromptTemplateResDto, UpdatePromptTemplateMutationDto>({
            query: ({ intent, data }) => ({
                url: BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.PROMPT_TEMPLATE(intent),
                method: 'PUT',
                body: data
            }),
            invalidatesTags: ['AiPromptTemplate']
        }),

        lockPromptTemplate: builder.mutation<UpdatePromptTemplateResDto, string>({
            query: (intent) => ({
                url: BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.LOCK_TEMPLATE(intent),
                method: 'PATCH'
            }),
            invalidatesTags: ['AiPromptTemplate']
        }),

        unlockPromptTemplate: builder.mutation<UpdatePromptTemplateResDto, string>({
            query: (intent) => ({
                url: BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.UNLOCK_TEMPLATE(intent),
                method: 'PATCH'
            }),
            invalidatesTags: ['AiPromptTemplate']
        }),

        updateFeatureFlags: builder.mutation<UpdateFeatureFlagsResDto, UpdateFeatureFlagsReqBodyDto>({
            query: ({ flags }) => ({
                url: BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.FEATURE_FLAGS,
                method: 'POST',
                body: { flags }
            }),
            invalidatesTags: ['AiCopilotSettings']
        })
    })
})

export const {
    useGetCopilotMetricsQuery,
    useGetCopilotSessionsQuery,
    useListPromptTemplatesQuery,
    useUpdatePromptTemplateMutation,
    useLockPromptTemplateMutation,
    useUnlockPromptTemplateMutation,
    useUpdateFeatureFlagsMutation
} = AdminAiCopilotApi
