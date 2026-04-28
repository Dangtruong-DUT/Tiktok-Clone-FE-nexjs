import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/client'
import type { CreateAppealRequest, GetMyAppealsParams } from '@/types/dtos/appeal/appeal-request.dto'
import type { CreateAppealResponse, GetMyAppealsResponse } from '@/types/dtos/appeal/appeal-response.dto'
import type { VerifyAppealTokenResponse, SubmitAppealEvidenceResponse } from '@/types/dtos/appeal/appeal-token.dto'
import { toQueryParams } from '@/utils/common/query-params.util'

export const AppealApi = createApi({
    reducerPath: 'AppealApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Appeals'],
    endpoints: (builder) => ({
        getMyAppeals: builder.query<GetMyAppealsResponse, GetMyAppealsParams>({
            query: (params) => ({
                url: '/appeals',
                params: toQueryParams(params)
            }),
            providesTags: [{ type: 'Appeals', id: 'LIST' }]
        }),

        createAppeal: builder.mutation<CreateAppealResponse, CreateAppealRequest>({
            query: (body) => ({
                url: '/appeals',
                method: 'POST',
                body
            }),
            invalidatesTags: [{ type: 'Appeals', id: 'LIST' }]
        }),

        verifyAppealToken: builder.query<VerifyAppealTokenResponse, string>({
            query: (token) => ({
                url: '/appeals/verify-token',
                params: { token }
            })
        }),

        submitAppealEvidence: builder.mutation<SubmitAppealEvidenceResponse, FormData>({
            query: (formData) => ({
                url: '/appeals/submit-evidence',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: [{ type: 'Appeals', id: 'LIST' }]
        })
    })
})

export const {
    useGetMyAppealsQuery,
    useCreateAppealMutation,
    useVerifyAppealTokenQuery,
    useSubmitAppealEvidenceMutation
} = AppealApi
