import { AdminApi } from './base.service'
import type { GetAdminCommentsRes, DeleteCommentRes } from '@/types/dtos/admin/admin-response.dto'
import type { GetAdminCommentsParams, DeleteCommentReq } from '@/types/dtos/admin/admin-request.dto'

const commentsApi = AdminApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdminComments: builder.query<GetAdminCommentsRes, GetAdminCommentsParams>({
            query: (params) => ({
                url: '/admin/comments',
                params
            }),
            providesTags: [{ type: 'AdminComments', id: 'LIST' }]
        }),

        deleteComment: builder.mutation<DeleteCommentRes, DeleteCommentReq>({
            query: ({ comment_uuid, ...body }) => ({
                url: `/admin/comments/${comment_uuid}/delete`,
                method: 'POST',
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
