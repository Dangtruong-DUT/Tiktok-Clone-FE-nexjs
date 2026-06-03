import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'

export const AdminAiCopilotApi = createApi({
    reducerPath:       'adminAiCopilotApi',
    baseQuery:         baseQueryWithReauth,
    tagTypes:          ['AiPromptTemplate', 'AiCopilotSettings'],
    keepUnusedDataFor: 60,
    endpoints: (builder) => ({
        getCopilotMetrics: builder.query<unknown, { period?: string }>({
            query: ({ period = 'today' }) =>
                `${BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.COPILOT_METRICS}?period=${period}`,
        }),

        getCopilotSessions: builder.query<unknown, { page?: number; perPage?: number }>({
            query: ({ page = 1, perPage = 20 }) =>
                `${BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.COPILOT_SESSIONS}?page=${page}&per_page=${perPage}`,
        }),

        listPromptTemplates: builder.query<unknown, void>({
            query: () => BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.PROMPT_TEMPLATES,
            providesTags: ['AiPromptTemplate'],
        }),

        updatePromptTemplate: builder.mutation<
            unknown,
            { intent: string; data: { system_prompt?: string; user_template?: string; display_name?: string; is_active?: boolean } }
        >({
            query: ({ intent, data }) => ({
                url:    BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.PROMPT_TEMPLATE(intent),
                method: 'PUT',
                body:   data,
            }),
            invalidatesTags: ['AiPromptTemplate'],
        }),

        updateFeatureFlags: builder.mutation<unknown, { flags: Record<string, boolean> }>({
            query: ({ flags }) => ({
                url:    BACKEND_API_ENDPOINT.ADMIN.AI_STUDIO.FEATURE_FLAGS,
                method: 'POST',
                body:   { flags },
            }),
            invalidatesTags: ['AiCopilotSettings'],
        }),
    }),
})

export const {
    useGetCopilotMetricsQuery,
    useGetCopilotSessionsQuery,
    useListPromptTemplatesQuery,
    useUpdatePromptTemplateMutation,
    useUpdateFeatureFlagsMutation,
} = AdminAiCopilotApi
