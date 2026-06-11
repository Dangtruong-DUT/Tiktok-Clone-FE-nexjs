import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/base/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import type { GetMyAppealsParams } from '@/types/dtos/appeal/appeal-request.dto'
import type {
    CreateAppealResponse,
    GetAppealResponse,
    GetMyAppealsResponse,
    GetResourcePreviewResponse
} from '@/types/dtos/appeal/appeal-response.dto'
import { toQueryParams } from '@/utils/common/query-params.util'

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
                url: BACKEND_API_ENDPOINT.APPEAL.RESOURCE_PREVIEW,
                params: { resource_type: resourceType, resource_uuid: resourceUuid ?? undefined }
            })
        }),

        getMyAppeals: builder.query<GetMyAppealsResponse, GetMyAppealsParams>({
            query: (params) => ({
                url: BACKEND_API_ENDPOINT.APPEAL.LIST,
                params: toQueryParams(params)
            }),
            providesTags: [{ type: 'Appeals', id: 'LIST' }]
        }),

        getAppeal: builder.query<GetAppealResponse, { uuid: string }>({
            query: ({ uuid }) => ({ url: BACKEND_API_ENDPOINT.APPEAL.DETAIL(uuid) }),
            providesTags: (_result, _error, { uuid }) => [{ type: 'Appeals', id: uuid }]
        }),

        createAppeal: builder.mutation<CreateAppealResponse, FormData>({
            query: (formData) => ({
                url: BACKEND_API_ENDPOINT.APPEAL.LIST,
                method: 'POST',
                body: formData
            }),
            invalidatesTags: [{ type: 'Appeals', id: 'LIST' }]
        }),

        updateAppeal: builder.mutation<CreateAppealResponse, { uuid: string; data: FormData }>({
            query: ({ uuid, data }) => ({
                url: BACKEND_API_ENDPOINT.APPEAL.DETAIL(uuid),
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
