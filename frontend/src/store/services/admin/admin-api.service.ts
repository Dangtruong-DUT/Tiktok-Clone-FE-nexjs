import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/client'

export const AdminApi = createApi({
    reducerPath: 'AdminApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['AdminUsers', 'AdminPosts', 'AdminComments', 'AdminActivity', 'DashboardStats', 'AdminAppeals'],
    endpoints: () => ({})
})
