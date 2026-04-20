import { AdminApi } from './admin-api.service'
import type {
    GetAdminUsersRes,
    BanUserRes,
    UnbanUserRes,
    DeleteUserRes,
    CommonMessageRes
} from '@/types/dtos/admin/admin-response.dto'
import type {
    GetAdminUsersParams,
    BanUserReq,
    UnbanUserReq,
    DeleteUserReq,
    ResetUserPasswordReq,
    SendUserMailReq
} from '@/types/dtos/admin/admin-request.dto'
import { toQueryParamsWithOrderBy } from '@/utils/common/order-by-params.util'

const adminUsersApi = AdminApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdminUsers: builder.query<GetAdminUsersRes, GetAdminUsersParams>({
            query: (params) => ({
                url: '/admin/users',
                params: toQueryParamsWithOrderBy(params)
            }),
            providesTags: [{ type: 'AdminUsers', id: 'LIST' }]
        }),

        banUser: builder.mutation<BanUserRes, BanUserReq>({
            query: ({ user_uuid, ...body }) => ({
                url: `/admin/users/${user_uuid}/ban`,
                method: 'POST',
                body
            }),
            invalidatesTags: (_result, _error, { user_uuid }) => [
                { type: 'AdminUsers', id: user_uuid },
                { type: 'AdminUsers', id: 'LIST' },
                { type: 'AdminActivity', id: 'LIST' }
            ]
        }),

        unbanUser: builder.mutation<UnbanUserRes, UnbanUserReq>({
            query: ({ user_uuid }) => ({
                url: `/admin/users/${user_uuid}/unban`,
                method: 'POST'
            }),
            invalidatesTags: (_result, _error, { user_uuid }) => [
                { type: 'AdminUsers', id: user_uuid },
                { type: 'AdminUsers', id: 'LIST' },
                { type: 'AdminActivity', id: 'LIST' }
            ]
        }),

        deleteUser: builder.mutation<DeleteUserRes, DeleteUserReq>({
            query: ({ user_uuid, ...body }) => ({
                url: `/admin/users/${user_uuid}`,
                method: 'DELETE',
                body
            }),
            invalidatesTags: [
                { type: 'AdminUsers', id: 'LIST' },
                { type: 'AdminActivity', id: 'LIST' }
            ]
        }),

        resetUserPassword: builder.mutation<CommonMessageRes, ResetUserPasswordReq>({
            query: ({ user_uuid, ...body }) => ({
                url: `/admin/users/${user_uuid}/reset-password`,
                method: 'POST',
                body
            }),
            invalidatesTags: [{ type: 'AdminActivity', id: 'LIST' }]
        }),

        sendUserMail: builder.mutation<CommonMessageRes, SendUserMailReq>({
            query: ({ user_uuid, ...body }) => ({
                url: `/admin/users/${user_uuid}/send-mail`,
                method: 'POST',
                body
            }),
            invalidatesTags: [{ type: 'AdminActivity', id: 'LIST' }]
        })
    }),
    overrideExisting: false
})

export const {
    useGetAdminUsersQuery,
    useBanUserMutation,
    useUnbanUserMutation,
    useDeleteUserMutation,
    useResetUserPasswordMutation,
    useSendUserMailMutation
} = adminUsersApi
