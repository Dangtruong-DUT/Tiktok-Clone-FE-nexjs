import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import { AiContentSuggestionType } from '@/types/models/ai-content-suggestion.model'
import { GenerateAiSuggestionReqBodyType } from '@/types/dtos/ai/ai-content-suggestion.dto'
import { ApiSuccessResponseWithData, ApiSuccessResponseWithMeta } from '@/types/common/http-response.type'

export const AiContentStudioApi = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ['AiSuggestion'],
    reducerPath: 'aiContentStudioApi',
    keepUnusedDataFor: 30,
    endpoints: (builder) => ({
        generateSuggestion: builder.mutation<
            ApiSuccessResponseWithData<AiContentSuggestionType>,
            GenerateAiSuggestionReqBodyType
        >({
            query: (body) => ({
                url: BACKEND_API_ENDPOINT.AI_STUDIO.GENERATE,
                method: 'POST',
                body
            }),
            invalidatesTags: ['AiSuggestion']
        }),

        getSuggestion: builder.query<ApiSuccessResponseWithData<AiContentSuggestionType>, string>({
            query: (uuid) => BACKEND_API_ENDPOINT.AI_STUDIO.BY_UUID(uuid),
            providesTags: (_, __, uuid) => [{ type: 'AiSuggestion', id: uuid }]
        }),

        listSuggestions: builder.query<
            ApiSuccessResponseWithMeta<AiContentSuggestionType[]>,
            { per_page?: number; page?: number }
        >({
            query: (params) => ({
                url: BACKEND_API_ENDPOINT.AI_STUDIO.LIST,
                params
            }),
            providesTags: ['AiSuggestion']
        }),

        applySuggestion: builder.mutation<ApiSuccessResponseWithData<AiContentSuggestionType>, string>({
            query: (uuid) => ({
                url: BACKEND_API_ENDPOINT.AI_STUDIO.APPLY(uuid),
                method: 'POST'
            }),
            invalidatesTags: (_, __, uuid) => [{ type: 'AiSuggestion', id: uuid }]
        })
    })
})

export const {
    useGenerateSuggestionMutation,
    useGetSuggestionQuery,
    useListSuggestionsQuery,
    useApplySuggestionMutation
} = AiContentStudioApi
