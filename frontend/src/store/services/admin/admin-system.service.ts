import { AdminApi } from './admin-api.service'
import type { GetActivityLogsRes, GetDashboardStatsRes } from '@/types/dtos/admin/admin-response.dto'
import type { GetActivityLogsParams, GetDashboardStatsParams } from '@/types/dtos/admin/admin-request.dto'

const adminSystemApi = AdminApi.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardStats: builder.query<GetDashboardStatsRes, GetDashboardStatsParams>({
            query: (params) => ({
                url: '/admin/dashboard/stats',
                params
            }),
            providesTags: [{ type: 'DashboardStats', id: 'STATS' }]
        }),

        getActivityLogs: builder.query<GetActivityLogsRes, GetActivityLogsParams>({
            query: (params) => ({
                url: '/admin/activity-logs',
                params
            }),
            providesTags: [{ type: 'AdminActivity', id: 'LIST' }]
        })
    }),
    overrideExisting: false
})

export const { useGetDashboardStatsQuery, useGetActivityLogsQuery } = adminSystemApi
