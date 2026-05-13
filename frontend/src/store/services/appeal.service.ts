import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/client'
import type { GetMyAppealsParams } from '@/types/dtos/appeal/appeal-request.dto'
import type {
    CreateAppealResponse,
    GetAppealResponse,
    GetMyAppealsResponse,
    GetResourcePreviewResponse
} from '@/types/dtos/appeal/appeal-response.dto'
import { toQueryParams } from '@/utils/common/query-params.util'

/**
 * Appeal API service — handles authenticated appeal flows only.
 *
 * - getMyAppeals: List user's appeals.
 * - getAppeal: Fetch appeal by UUID.
 * - createAppeal: Create a new appeal (auth required).
 * - updateAppeal: Update an existing appeal (auth required).
 */
export const AppealApi = createApi({
    reducerPath: 'AppealApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Appeals'],
    endpoints: (builder) => ({
        getResourcePreview: builder.query<
            GetResourcePreviewResponse,
            { resourceType: string; resourceUuid?: string | null }
        >({
            query: ({ resourceType, resourceUuid }) => ({
                url: '/appeals/resource-preview',
                params: { resource_type: resourceType, resource_uuid: resourceUuid ?? undefined }
            })
        }),

        getMyAppeals: builder.query<GetMyAppealsResponse, GetMyAppealsParams>({
            query: (params) => ({
                url: '/appeals',
                params: toQueryParams(params)
            }),
            providesTags: [{ type: 'Appeals', id: 'LIST' }]
        }),

        getAppeal: builder.query<GetAppealResponse, { uuid: string }>({
            query: ({ uuid }) => ({
                url: `/appeals/${uuid}`
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

        updateAppeal: builder.mutation<CreateAppealResponse, { uuid: string; data: FormData }>({
            query: ({ uuid, data }) => ({
                url: `/appeals/${uuid}`,
                method: 'POST',
                body: data
            }),
            invalidatesTags: (_result, _error, { uuid }) => [
                { type: 'Appeals', id: 'LIST' },
                { type: 'Appeals', id: uuid }
            ]
        })
    })
})

export const {
    useGetResourcePreviewQuery,
    useGetMyAppealsQuery,
    useGetAppealQuery,
    useCreateAppealMutation,
    useUpdateAppealMutation
} = AppealApi
