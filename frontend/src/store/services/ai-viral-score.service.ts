import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import type { AiViralScoreType } from '@/types/models/ai-viral-score.model'
import type { AnalyzeViralScoreBody } from '@/types/dtos/ai/ai-viral-score.dto'
import type { ApiSuccessResponseWithData } from '@/types/common/http-response.type'

const VIRAL_SCORE_POLL_INTERVAL_MS = 2_000

export const AiViralScoreApi = createApi({
    reducerPath:       'aiViralScoreApi',
    baseQuery:         baseQueryWithReauth,
    tagTypes:          ['AiViralScore'],
    keepUnusedDataFor: 120,
    endpoints: (builder) => ({
        analyzeViralScore: builder.mutation<ApiSuccessResponseWithData<AiViralScoreType>, AnalyzeViralScoreBody>({
            query: (body) => ({
                url:    BACKEND_API_ENDPOINT.AI_STUDIO.VIRAL_SCORE.ANALYZE,
                method: 'POST',
                body,
            }),
        }),

        getViralScore: builder.query<ApiSuccessResponseWithData<AiViralScoreType>, string>({
            query: (uuid) => BACKEND_API_ENDPOINT.AI_STUDIO.VIRAL_SCORE.BY_UUID(uuid),
            providesTags: (_result, _error, uuid) => [{ type: 'AiViralScore', id: uuid }],
        }),
    }),
})

export const { useAnalyzeViralScoreMutation, useGetViralScoreQuery } = AiViralScoreApi
export { VIRAL_SCORE_POLL_INTERVAL_MS }
