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
        }),

        verifyAppealToken: builder.mutation<{ data: { email: string; appeal_type: string; resource_id: number; resource_type: string } }, { token: string }>({
            query: (data) => ({
                url: '/appeals/guest/verify-token',
                method: 'POST',
                body: data
            })
        }),

        requestAppealToken: builder.mutation<{ message: string }, { email: string; appeal_type: string; resource_type: string; resource_id?: number }>({
            query: (data) => ({
                url: '/appeals/guest/request-token',
                method: 'POST',
                body: data
            })
        }),

        updateAppeal: builder.mutation<CreateAppealResponse, { uuid: string; data: FormData }>({
            query: ({ uuid, data }) => ({
                url: `/appeals/${uuid}`,
                method: 'POST', // Send as POST with _method=PUT in FormData
                body: data
            }),
            invalidatesTags: (_result, _error, { uuid }) => [{ type: 'Appeals', id: 'LIST' }, { type: 'Appeals', id: uuid }]
        })
    })
})

export const { useGetMyAppealsQuery, useGetAppealQuery, useCreateAppealMutation, useVerifyAppealTokenMutation, useRequestAppealTokenMutation, useUpdateAppealMutation } = AppealApi
