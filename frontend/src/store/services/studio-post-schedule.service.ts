import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import type { ScheduledPostType } from '@/types/models/scheduled-post.model'
import type { StudioPostItem, StudioPostStatus } from '@/types/models/studio-post.model'
import type { SchedulePostBody } from '@/types/dtos/studio/studio-post.dto'
import type { ApiSuccessResponseWithData, ApiSuccessResponseWithMeta } from '@/types/common/http-response.type'

export const StudioPostScheduleApi = createApi({
    reducerPath: 'studioPostScheduleApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['ScheduledPost', 'StudioPost'],
    keepUnusedDataFor: 60,
    endpoints: (builder) => ({
        listStudioPosts: builder.query<
            ApiSuccessResponseWithMeta<StudioPostItem[]>,
            { status?: StudioPostStatus; page?: number; per_page?: number; q?: string; has_schedule?: 0 | 1 }
        >({
            query: (params) => ({ url: BACKEND_API_ENDPOINT.STUDIO_POSTS.LIST, params }),
            providesTags: ['StudioPost']
        }),

        listScheduledPosts: builder.query<
            ApiSuccessResponseWithMeta<ScheduledPostType[]>,
            { page?: number; per_page?: number }
        >({
            query: (params) => ({ url: BACKEND_API_ENDPOINT.STUDIO_POSTS.SCHEDULED, params }),
            providesTags: ['ScheduledPost']
        }),

        schedulePost: builder.mutation<
            ApiSuccessResponseWithData<ScheduledPostType>,
            { postUuid: string } & SchedulePostBody
        >({
            query: ({ postUuid, ...body }) => ({
                url: BACKEND_API_ENDPOINT.STUDIO_POSTS.SCHEDULE(postUuid),
                method: 'POST',
                body
            }),
            invalidatesTags: ['ScheduledPost', 'StudioPost']
        }),

        reschedulePost: builder.mutation<
            ApiSuccessResponseWithData<ScheduledPostType>,
            { schedUuid: string } & SchedulePostBody
        >({
            query: ({ schedUuid, ...body }) => ({
                url: BACKEND_API_ENDPOINT.STUDIO_POSTS.RESCHEDULE(schedUuid),
                method: 'PUT',
                body
            }),
            invalidatesTags: ['ScheduledPost', 'StudioPost']
        }),

        publishNow: builder.mutation<ApiSuccessResponseWithData<{ uuid: string; status: string }>, string>({
            query: (postUuid) => ({
                url: BACKEND_API_ENDPOINT.STUDIO_POSTS.PUBLISH_NOW(postUuid),
                method: 'POST'
            }),
            invalidatesTags: ['ScheduledPost', 'StudioPost']
        }),

        cancelSchedule: builder.mutation<ApiSuccessResponseWithData<ScheduledPostType>, string>({
            query: (schedUuid) => ({
                url: BACKEND_API_ENDPOINT.STUDIO_POSTS.CANCEL(schedUuid),
                method: 'POST'
            }),
            invalidatesTags: ['ScheduledPost', 'StudioPost']
        })
    })
})

export const {
    useListStudioPostsQuery,
    useListScheduledPostsQuery,
    useSchedulePostMutation,
    useReschedulePostMutation,
    usePublishNowMutation,
    useCancelScheduleMutation
} = StudioPostScheduleApi
