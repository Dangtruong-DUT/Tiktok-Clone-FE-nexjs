import { AdminApi } from './admin-api.service'
import type { GetAdminPostsRes, DeletePostRes } from '@/types/dtos/admin/admin-response.dto'
import type { GetAdminPostsParams, DeletePostReq } from '@/types/dtos/admin/admin-request.dto'
import { toQueryParamsWithOrderBy } from '@/utils/common/order-by-params.util'

const adminPostsApi = AdminApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdminPosts: builder.query<GetAdminPostsRes, GetAdminPostsParams>({
            query: (params) => ({
                url: '/admin/posts',
                params: toQueryParamsWithOrderBy(params)
            }),
            providesTags: [{ type: 'AdminPosts', id: 'LIST' }]
        }),

        deletePost: builder.mutation<DeletePostRes, DeletePostReq>({
            query: ({ post_uuid, ...body }) => ({
                url: `/admin/posts/${post_uuid}`,
                method: 'DELETE',
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

export const { useGetAdminPostsQuery, useDeletePostMutation } = adminPostsApi
