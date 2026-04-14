import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/client'
import type {
    GetAdminUsersRes,
    BanUserRes,
    UnbanUserRes,
    DeleteUserRes,
    CommonMessageRes,
    GetAdminPostsRes,
    HidePostRes,
    UnhidePostRes,
    DeletePostRes,
    GetAdminCommentsRes,
    DeleteCommentRes,
    GetActivityLogsRes,
    GetDashboardStatsRes
} from '@/types/dtos/admin/admin-response.dto'
import type {
    GetAdminUsersParams,
    BanUserReq,
    ResetUserPasswordReq,
    SendUserMailReq,
    GetAdminPostsParams,
    HidePostReq,
    GetAdminCommentsParams,
    GetActivityLogsParams
} from '@/types/dtos/admin/admin-request.dto'

/**
 * Admin API Service - RTK Query endpoints for all admin operations
 * Handles: user management, content moderation, system monitoring
 *
 * Usage:
 *   const { data, isLoading } = useGetAdminUsersQuery({ page: 1, per_page: 20 })
 *   const [banUser] = useBanUserMutation()
 */
export const AdminApi = createApi({
    reducerPath: 'AdminApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['AdminUsers', 'AdminPosts', 'AdminComments', 'AdminActivity', 'DashboardStats'],

    endpoints: (builder) => ({
        // ===== USER ENDPOINTS =====
        /**
         * Get paginated list of users with filtering
         * GET /admin/users?page=1&per_page=20&search=john&status=active
         */
        getAdminUsers: builder.query<GetAdminUsersRes, GetAdminUsersParams>({
            query: (params) => ({
                url: '/admin/users',
                params
            }),
            providesTags: (result) =>
                result?.data?.length
                    ? [
                          ...result.data.map((user) => ({ type: 'AdminUsers' as const, id: user.id })),
                          { type: 'AdminUsers', id: 'LIST' }
                      ]
                    : [{ type: 'AdminUsers', id: 'LIST' }]
        }),

        /**
         * Ban a user account
         * POST /admin/users/{user_id}/ban
         */
        banUser: builder.mutation<BanUserRes, BanUserReq>({
            query: ({ user_id, ...body }) => ({
                url: `/admin/users/${user_id}/ban`,
                method: 'POST',
                body
            }),
            invalidatesTags: (_result, _error, { user_id }) => [
                { type: 'AdminUsers', id: user_id },
                { type: 'AdminUsers', id: 'LIST' },
                { type: 'AdminActivity', id: 'LIST' }
            ]
        }),

        /**
         * Unban a user account
         * POST /admin/users/{user_id}/unban
         */
        unbanUser: builder.mutation<UnbanUserRes, { user_id: number }>({
            query: ({ user_id }) => ({
                url: `/admin/users/${user_id}/unban`,
                method: 'POST'
            }),
            invalidatesTags: (_result, _error, { user_id }) => [
                { type: 'AdminUsers', id: user_id },
                { type: 'AdminUsers', id: 'LIST' },
                { type: 'AdminActivity', id: 'LIST' }
            ]
        }),

        /**
         * Delete a user account
         * POST /admin/users/{user_id}/delete
         */
        deleteUser: builder.mutation<DeleteUserRes, { user_id: number; reason: string }>({
            query: ({ user_id, ...body }) => ({
                url: `/admin/users/${user_id}/delete`,
                method: 'POST',
                body
            }),
            invalidatesTags: [
                { type: 'AdminUsers', id: 'LIST' },
                { type: 'AdminActivity', id: 'LIST' }
            ]
        }),

        /**
         * Reset user password by admin
         * POST /admin/users/{user_id}/reset-password
         */
        resetUserPassword: builder.mutation<CommonMessageRes, ResetUserPasswordReq>({
            query: ({ user_id, ...body }) => ({
                url: `/admin/users/${user_id}/reset-password`,
                method: 'POST',
                body
            }),
            invalidatesTags: [{ type: 'AdminActivity', id: 'LIST' }]
        }),

        /**
         * Send direct mail to user
         * POST /admin/users/{user_id}/send-mail
         */
        sendUserMail: builder.mutation<CommonMessageRes, SendUserMailReq>({
            query: ({ user_id, ...body }) => ({
                url: `/admin/users/${user_id}/send-mail`,
                method: 'POST',
                body
            }),
            invalidatesTags: [{ type: 'AdminActivity', id: 'LIST' }]
        }),

        // ===== POST ENDPOINTS =====
        /**
         * Get paginated list of posts with filtering
         * GET /admin/posts?page=1&per_page=20&status=all&search=query
         */
        getAdminPosts: builder.query<GetAdminPostsRes, GetAdminPostsParams>({
            query: (params) => ({
                url: '/admin/posts',
                params
            }),
            providesTags: (result) =>
                result?.data?.length
                    ? [
                          ...result.data.map((post) => ({ type: 'AdminPosts' as const, id: post.uuid })),
                          { type: 'AdminPosts', id: 'LIST' }
                      ]
                    : [{ type: 'AdminPosts', id: 'LIST' }]
        }),

        /**
         * Hide a post from public view
         * POST /admin/posts/{uuid}/hide
         */
        hidePost: builder.mutation<HidePostRes, HidePostReq>({
            query: ({ post_uuid, ...body }) => ({
                url: `/admin/posts/${post_uuid}/hide`,
                method: 'POST',
                body
            }),
            invalidatesTags: (_result, _error, { post_uuid }) => [
                { type: 'AdminPosts', id: post_uuid },
                { type: 'AdminPosts', id: 'LIST' },
                { type: 'AdminActivity', id: 'LIST' }
            ]
        }),

        /**
         * Unhide a post (make it visible)
         * POST /admin/posts/{uuid}/unhide
         */
        unhidePost: builder.mutation<UnhidePostRes, { post_uuid: string }>({
            query: ({ post_uuid }) => ({
                url: `/admin/posts/${post_uuid}/unhide`,
                method: 'POST'
            }),
            invalidatesTags: (_result, _error, { post_uuid }) => [
                { type: 'AdminPosts', id: post_uuid },
                { type: 'AdminPosts', id: 'LIST' },
                { type: 'AdminActivity', id: 'LIST' }
            ]
        }),

        /**
         * Delete a post permanently
         * POST /admin/posts/{uuid}/delete
         */
        deletePost: builder.mutation<DeletePostRes, { post_uuid: string; reason: string }>({
            query: ({ post_uuid, ...body }) => ({
                url: `/admin/posts/${post_uuid}/delete`,
                method: 'POST',
                body
            }),
            invalidatesTags: [
                { type: 'AdminPosts', id: 'LIST' },
                { type: 'AdminActivity', id: 'LIST' }
            ]
        }),

        /**
         * Get paginated list of comments with filtering
         * GET /admin/comments?page=1&per_page=20&post_uuid=xxx
         */
        getAdminComments: builder.query<GetAdminCommentsRes, GetAdminCommentsParams>({
            query: (params) => ({
                url: '/admin/comments',
                params
            }),
            providesTags: [{ type: 'AdminComments', id: 'LIST' }]
        }),

        /**
         * Delete a comment
         * POST /admin/comments/{id}/delete
         */
        deleteComment: builder.mutation<DeleteCommentRes, { comment_id: number; reason: string }>({
            query: ({ comment_id, ...body }) => ({
                url: `/admin/comments/${comment_id}/delete`,
                method: 'POST',
                body
            }),
            invalidatesTags: [
                { type: 'AdminComments', id: 'LIST' },
                { type: 'AdminActivity', id: 'LIST' }
            ]
        }),

        /**
         * Get dashboard statistics
         * GET /admin/dashboard/stats?period=today
         */
        getDashboardStats: builder.query<GetDashboardStatsRes, { period?: 'today' | 'week' | 'month' | 'year' }>({
            query: (params) => ({
                url: '/admin/dashboard/stats',
                params
            }),
            providesTags: [{ type: 'DashboardStats', id: 'STATS' }]
        }),

        /**
         * Get activity logs (admin actions or system events)
         * GET /admin/activity-logs?log_type=admin&page=1&per_page=20
         */
        getActivityLogs: builder.query<GetActivityLogsRes, GetActivityLogsParams>({
            query: (params) => ({
                url: '/admin/activity-logs',
                params
            }),
            providesTags: [{ type: 'AdminActivity', id: 'LIST' }]
        })
    })
})

export const {
    useGetAdminUsersQuery,
    useBanUserMutation,
    useUnbanUserMutation,
    useDeleteUserMutation,
    useResetUserPasswordMutation,
    useSendUserMailMutation,
    useGetAdminPostsQuery,
    useHidePostMutation,
    useUnhidePostMutation,
    useDeletePostMutation,
    useGetAdminCommentsQuery,
    useDeleteCommentMutation,
    useGetDashboardStatsQuery,
    useGetActivityLogsQuery
} = AdminApi
