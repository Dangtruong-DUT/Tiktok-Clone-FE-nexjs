import { AdminApi } from './admin-api.service'
import type {
    ApproveAppealRequest,
    GetAdminAppealsParams,
    RejectAppealRequest
} from '@/types/dtos/admin/admin-request.dto'
import type { GetAdminAppealsResponse, ReviewAppealResponse } from '@/types/dtos/admin/admin-response.dto'
import { toQueryParamsWithOrderBy } from '@/utils/common/order-by-params.util'

const adminAppealsApi = AdminApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdminAppeals: builder.query<GetAdminAppealsResponse, GetAdminAppealsParams>({
            query: (params) => ({
                url: '/admin/appeals',
                params: toQueryParamsWithOrderBy(params)
            }),
            providesTags: [{ type: 'AdminAppeals', id: 'LIST' }]
        }),

        approveAppeal: builder.mutation<ReviewAppealResponse, ApproveAppealRequest>({
            query: ({ appeal_uuid, ...body }) => ({
                url: `/admin/appeals/${appeal_uuid}/approve`,
                method: 'POST',
                body
            }),
            invalidatesTags: [
                { type: 'AdminAppeals', id: 'LIST' },
                { type: 'AdminActivity', id: 'LIST' }
            ]
        }),

        rejectAppeal: builder.mutation<ReviewAppealResponse, RejectAppealRequest>({
            query: ({ appeal_uuid, ...body }) => ({
                url: `/admin/appeals/${appeal_uuid}/reject`,
                method: 'POST',
                body
            }),
            invalidatesTags: [
                { type: 'AdminAppeals', id: 'LIST' },
                { type: 'AdminActivity', id: 'LIST' }
            ]
        })
    }),
    overrideExisting: false
})

export const { useGetAdminAppealsQuery, useApproveAppealMutation, useRejectAppealMutation } = adminAppealsApi
