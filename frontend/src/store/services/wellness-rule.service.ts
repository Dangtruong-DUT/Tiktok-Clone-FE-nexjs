import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import type { WellnessRuleItem, ParsedRulePreview, WellnessAnalysisType } from '@/types/models/screen-time.model'
import type { SaveWellnessRuleBody } from '@/types/dtos/wellness/wellness-rule.dto'
import type { ApiSuccessResponseWithData } from '@/types/common/http-response.type'

export const WellnessRuleApi = createApi({
    reducerPath: 'wellnessRuleApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['WellnessRule'],
    keepUnusedDataFor: 120,
    endpoints: (builder) => ({
        listRules: builder.query<ApiSuccessResponseWithData<WellnessRuleItem[]>, void>({
            query: () => BACKEND_API_ENDPOINT.WELLNESS.RULES,
            providesTags: ['WellnessRule']
        }),

        createRule: builder.mutation<ApiSuccessResponseWithData<WellnessRuleItem>, SaveWellnessRuleBody>({
            query: (body) => ({ url: BACKEND_API_ENDPOINT.WELLNESS.RULES, method: 'POST', body }),
            invalidatesTags: ['WellnessRule']
        }),

        updateRule: builder.mutation<
            ApiSuccessResponseWithData<WellnessRuleItem>,
            { uuid: string } & Partial<SaveWellnessRuleBody>
        >({
            query: ({ uuid, ...body }) => ({
                url: BACKEND_API_ENDPOINT.WELLNESS.RULE(uuid),
                method: 'PUT',
                body
            }),
            invalidatesTags: ['WellnessRule']
        }),

        deleteRule: builder.mutation<ApiSuccessResponseWithData<null>, string>({
            query: (uuid) => ({ url: BACKEND_API_ENDPOINT.WELLNESS.RULE(uuid), method: 'DELETE' }),
            invalidatesTags: ['WellnessRule']
        }),

        parseNLRule: builder.mutation<ApiSuccessResponseWithData<ParsedRulePreview>, { text: string }>({
            query: (body) => ({ url: BACKEND_API_ENDPOINT.WELLNESS.PARSE_RULE, method: 'POST', body })
        }),

        analyzeUsage: builder.mutation<ApiSuccessResponseWithData<WellnessAnalysisType>, void>({
            query: () => ({ url: BACKEND_API_ENDPOINT.WELLNESS.ANALYZE, method: 'POST' })
        })
    })
})

export const {
    useListRulesQuery,
    useCreateRuleMutation,
    useUpdateRuleMutation,
    useDeleteRuleMutation,
    useParseNLRuleMutation,
    useAnalyzeUsageMutation
} = WellnessRuleApi
