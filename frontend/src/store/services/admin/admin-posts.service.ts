import { AdminApi } from './admin-api.service'
import type { GetAdminPostsRes, HidePostRes, UnhidePostRes, DeletePostRes } from '@/types/dtos/admin/admin-response.dto'
import type {
    GetAdminPostsParams,
    HidePostReq,
    UnhidePostReq,
    DeletePostReq
} from '@/types/dtos/admin/admin-request.dto'

const adminPostsApi = AdminApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdminPosts: builder.query<GetAdminPostsRes, GetAdminPostsParams>({
            query: (params) => ({
                url: '/admin/posts',
                params
            }),
            providesTags: [{ type: 'AdminPosts', id: 'LIST' }]
        }),

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

        unhidePost: builder.mutation<UnhidePostRes, UnhidePostReq>({
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

        deletePost: builder.mutation<DeletePostRes, DeletePostReq>({
            query: ({ post_uuid, ...body }) => ({
                url: `/admin/posts/${post_uuid}/delete`,
                method: 'POST',
                body
            }),
            invalidatesTags: [
                { type: 'AdminPosts', id: 'LIST' },
                { type: 'AdminActivity', id: 'LIST' }
            ]
        })
    }),
    overrideExisting: false
})

export const { useGetAdminPostsQuery, useHidePostMutation, useUnhidePostMutation, useDeletePostMutation } =
    adminPostsApi
