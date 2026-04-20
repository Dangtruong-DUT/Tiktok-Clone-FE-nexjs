import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/client'
import type { CreateAppealRequest, GetMyAppealsParams } from '@/types/dtos/appeal/appeal-request.dto'
import type { CreateAppealResponse, GetMyAppealsResponse } from '@/types/dtos/appeal/appeal-response.dto'
import { toQueryParamsWithOrderBy } from '@/utils/common/order-by-params.util'

export const AppealApi = createApi({
    reducerPath: 'AppealApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Appeals'],
    endpoints: (builder) => ({
        getMyAppeals: builder.query<GetMyAppealsResponse, GetMyAppealsParams>({
            query: (params) => ({
                url: '/appeals',
                params: toQueryParamsWithOrderBy(params)
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
        })
    })
})

export const { useGetMyAppealsQuery, useCreateAppealMutation } = AppealApi
