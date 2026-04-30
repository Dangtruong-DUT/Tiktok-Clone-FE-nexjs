import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/client'
import type { GetMyAppealsParams } from '@/types/dtos/appeal/appeal-request.dto'
import type { CreateAppealResponse, GetAppealResponse, GetMyAppealsResponse } from '@/types/dtos/appeal/appeal-response.dto'
import { toQueryParams } from '@/utils/common/query-params.util'

/**
 * Appeal API service — handles both public (token-based) and authenticated flows.
 *
 * - getMyAppeals: Authenticated — list user's appeals.
 * - getAppeal: Flexible auth — fetch appeal by UUID (with optional token).
 * - createAppeal: Flexible — token flow (public) or auth flow (authenticated).
 */
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

        getAppeal: builder.query<GetAppealResponse, { uuid: string; token?: string }>({
            query: ({ uuid, token }) => ({
                url: `/appeals/${uuid}`,
                params: token ? { token } : undefined
            }),
            providesTags: (_result, _error, { uuid }) => [{ type: 'Appeals', id: uuid }]
        }),

        createAppeal: builder.mutation<CreateAppealResponse, FormData>({
            query: (formData) => ({
                url: '/appeals',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: [{ type: 'Appeals', id: 'LIST' }]
        })
    })
})

export const { useGetMyAppealsQuery, useGetAppealQuery, useCreateAppealMutation } = AppealApi
