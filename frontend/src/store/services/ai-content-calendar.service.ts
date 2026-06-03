import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import type { AiContentCalendarType, AiContentCalendarItemType } from '@/types/models/ai-content-calendar.model'
import type { ScheduledPostType } from '@/types/models/scheduled-post.model'
import type { GenerateCalendarBody, ScheduleCalendarItemBody } from '@/types/dtos/ai/ai-content-calendar.dto'
import type { ApiSuccessResponseWithData, ApiSuccessResponseWithMeta } from '@/types/common/http-response.type'

export const AiContentCalendarApi = createApi({
    reducerPath:       'aiContentCalendarApi',
    baseQuery:         baseQueryWithReauth,
    tagTypes:          ['AiCalendar'],
    keepUnusedDataFor: 300,
    endpoints: (builder) => ({
        generateCalendar: builder.mutation<ApiSuccessResponseWithData<AiContentCalendarType>, GenerateCalendarBody>({
            query: (body) => ({
                url:    BACKEND_API_ENDPOINT.AI_STUDIO.CALENDAR.GENERATE,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['AiCalendar'],
        }),

        listCalendars: builder.query<ApiSuccessResponseWithMeta<AiContentCalendarType[]>, { page?: number; per_page?: number }>({
            query: (params) => ({ url: BACKEND_API_ENDPOINT.AI_STUDIO.CALENDAR.LIST, params }),
            providesTags: ['AiCalendar'],
        }),

        getCalendar: builder.query<ApiSuccessResponseWithData<AiContentCalendarType>, string>({
            query: (uuid) => BACKEND_API_ENDPOINT.AI_STUDIO.CALENDAR.BY_UUID(uuid),
            providesTags: (_result, _error, uuid) => [{ type: 'AiCalendar', id: uuid }],
        }),

        createDraft: builder.mutation<ApiSuccessResponseWithData<AiContentCalendarItemType>, string>({
            query: (itemUuid) => ({
                url:    BACKEND_API_ENDPOINT.AI_STUDIO.CALENDAR.CREATE_DRAFT(itemUuid),
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, itemUuid) => [{ type: 'AiCalendar', id: itemUuid }],
        }),

        scheduleItem: builder.mutation<ApiSuccessResponseWithData<ScheduledPostType>, { itemUuid: string } & ScheduleCalendarItemBody>({
            query: ({ itemUuid, ...body }) => ({
                url:    BACKEND_API_ENDPOINT.AI_STUDIO.CALENDAR.SCHEDULE(itemUuid),
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { itemUuid }) => [{ type: 'AiCalendar', id: itemUuid }],
        }),
    }),
})

export const {
    useGenerateCalendarMutation,
    useListCalendarsQuery,
    useGetCalendarQuery,
    useCreateDraftMutation,
    useScheduleItemMutation,
} = AiContentCalendarApi
