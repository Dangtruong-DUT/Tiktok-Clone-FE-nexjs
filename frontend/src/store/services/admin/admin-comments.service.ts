import { AdminApi } from './admin-api.service'
import type { GetAdminCommentsRes, DeleteCommentRes } from '@/types/dtos/admin/admin-response.dto'
import type { GetAdminCommentsParams, DeleteCommentReq } from '@/types/dtos/admin/admin-request.dto'
import { toQueryParamsWithOrderBy } from '@/utils/common/order-by-params.util'

const commentsApi = AdminApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdminComments: builder.query<GetAdminCommentsRes, GetAdminCommentsParams>({
            query: (params) => ({
                url: '/admin/comments',
                params: toQueryParamsWithOrderBy(params)
            }),
            providesTags: [{ type: 'AdminComments', id: 'LIST' }]
        }),

        deleteComment: builder.mutation<DeleteCommentRes, DeleteCommentReq>({
            query: ({ comment_uuid, ...body }) => ({
                url: `/admin/comments/${comment_uuid}`,
                method: 'DELETE',
                body
            }),
            invalidatesTags: [
                { type: 'AdminComments', id: 'LIST' },
                { type: 'AdminActivity', id: 'LIST' }
            ]
        })
    }),
    overrideExisting: false
})

export const { useGetAdminCommentsQuery, useDeleteCommentMutation } = commentsApi
