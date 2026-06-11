import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/base/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import type { AdminScheduledPostMetrics, AdminScheduledPostItem } from '@/types/models/scheduled-post.model'
import type { ApiSuccessResponseWithData, ApiSuccessResponseWithMeta } from '@/types/common/http-response.type'

interface AdminScheduledPostFilters {
    status?: string
    source?: string
    user_uuid?: string
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
}

export const AdminScheduledPostsApi = createApi({
    reducerPath: 'adminScheduledPostsApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['AdminScheduledPost'],
    keepUnusedDataFor: 60,
    endpoints: (builder) => ({
        getScheduledPostMetrics: builder.query<
            ApiSuccessResponseWithData<AdminScheduledPostMetrics>,
            { period?: string }
        >({
            query: ({ period = 'today' }) => ({
                url: BACKEND_API_ENDPOINT.ADMIN.SCHEDULED_POSTS.METRICS,
                params: { period }
            }),
            providesTags: ['AdminScheduledPost']
        }),

        listScheduledPosts: builder.query<
            ApiSuccessResponseWithMeta<AdminScheduledPostItem[]>,
            AdminScheduledPostFilters
        >({
            query: (params) => ({
                url: BACKEND_API_ENDPOINT.ADMIN.SCHEDULED_POSTS.REQUESTS,
                params
            }),
            providesTags: ['AdminScheduledPost']
        }),

        adminCancelSchedule: builder.mutation<ApiSuccessResponseWithData<AdminScheduledPostItem>, string>({
            query: (uuid) => ({
                url: BACKEND_API_ENDPOINT.ADMIN.SCHEDULED_POSTS.CANCEL(uuid),
                method: 'POST'
            }),
            invalidatesTags: ['AdminScheduledPost']
        }),

        adminRetrySchedule: builder.mutation<ApiSuccessResponseWithData<AdminScheduledPostItem>, string>({
            query: (uuid) => ({
                url: BACKEND_API_ENDPOINT.ADMIN.SCHEDULED_POSTS.RETRY(uuid),
                method: 'POST'
            }),
            invalidatesTags: ['AdminScheduledPost']
        })
    })
})

export const {
    useGetScheduledPostMetricsQuery,
    useListScheduledPostsQuery,
    useAdminCancelScheduleMutation,
    useAdminRetryScheduleMutation
} = AdminScheduledPostsApi
