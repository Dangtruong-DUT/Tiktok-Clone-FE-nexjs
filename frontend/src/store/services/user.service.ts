import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import baseQueryWithReauth from '@/store/services/client'
import { UserIndicatorsResponse } from '@/types/dtos/stats/stats-response.dto'
import {
    GetListUserResType,
    GetUserProfileResType,
    GetUserSettingsResType,
    UpdateUserResType,
    UpdateUserSettingsResType
} from '@/types/dtos/user/user-response.dto'
import {
    ForgotPasswordReqBodyType,
    ResetPasswordReqBodyType,
    verifyForgotPasswordReqBodyType
} from '@/types/dtos/auth/auth-request.dto'
import {
    ChangePasswordBodyType,
    FollowUserReqBodyType,
    GetUserIndicatorQueryParamsType,
    GetSuggestedUsersQueryType,
    GetUserListPagingQueryType,
    UpdateUserSettingsBodyType,
    UpdateUserBodyType
} from '@/types/dtos/user/user-request.dto'
import { createApi } from '@reduxjs/toolkit/query/react'
import queryString from 'query-string'

export const UserApi = createApi({
    reducerPath: 'UserApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Users', 'UserIndicators', 'UserSettings'],
    refetchOnMountOrArgChange: false,
    keepUnusedDataFor: 60,
    refetchOnFocus: false,
    refetchOnReconnect: true,
    endpoints: (builder) => ({
        forgotPassword: builder.mutation<{ message: string }, ForgotPasswordReqBodyType>({
            query: (data) => ({
                url: BACKEND_API_ENDPOINT.AUTH.FORGOT_PASSWORD,
                method: 'POST',
                body: data
            })
        }),
        verifyForgotPassword: builder.mutation<{ message: string }, verifyForgotPasswordReqBodyType>({
            query: (data) => ({
                url: BACKEND_API_ENDPOINT.AUTH.VERIFY_FORGOT_PASSWORD,
                method: 'POST',
                body: data
            })
        }),
        resetPassword: builder.mutation<{ message: string }, ResetPasswordReqBodyType>({
            query: (data) => ({
                url: BACKEND_API_ENDPOINT.AUTH.RESET_PASSWORD,
                method: 'POST',
                body: data
            })
        }),
        getMe: builder.query<GetUserProfileResType, void>({
            query: () => ({ url: BACKEND_API_ENDPOINT.USER.ME, method: 'GET' }),
            providesTags: (result) => (result ? [{ type: 'Users', id: result.data.uuid }] : [])
        }),
        getUserByUsername: builder.query<GetUserProfileResType, string>({
            query: (username) => ({ url: BACKEND_API_ENDPOINT.USER.BY_USERNAME(username), method: 'GET' }),
            providesTags: (result) => (result ? [{ type: 'Users', id: result.data.uuid }] : [])
        }),
        getFollowersOfUser: builder.query<GetListUserResType, GetUserListPagingQueryType>({
            query: ({ user_uuid, page = 1, per_page = 10, q }) => {
                const qs = queryString.stringify({ page, per_page, q }, { skipNull: true, skipEmptyString: true })
                return `${BACKEND_API_ENDPOINT.USER.FOLLOWERS(user_uuid)}${qs ? `?${qs}` : ''}`
            },
            providesTags: (result) =>
                result
                    ? [
                          ...result.data.map((user) => ({ type: 'Users' as const, id: user.uuid })),
                          { type: 'Users' as const, id: 'LIST' }
                      ]
                    : [{ type: 'Users' as const, id: 'LIST' }]
        }),
        getFollowingOfUser: builder.query<GetListUserResType, GetUserListPagingQueryType>({
            query: ({ user_uuid, page = 1, per_page = 10, q }) => {
                const qs = queryString.stringify({ page, per_page, q }, { skipNull: true, skipEmptyString: true })
                return `${BACKEND_API_ENDPOINT.USER.FOLLOWING(user_uuid)}${qs ? `?${qs}` : ''}`
            },
            providesTags: (result) =>
                result
                    ? [
                          ...result.data.map((user) => ({ type: 'Users' as const, id: user.uuid })),
                          { type: 'Users' as const, id: 'LIST' }
                      ]
                    : [{ type: 'Users' as const, id: 'LIST' }]
        }),
        getFriendsOfUser: builder.query<GetListUserResType, GetUserListPagingQueryType>({
            query: ({ user_uuid, page = 1, per_page = 10, q }) => {
                const qs = queryString.stringify({ page, per_page, q }, { skipNull: true, skipEmptyString: true })
                return `${BACKEND_API_ENDPOINT.USER.FRIENDS(user_uuid)}${qs ? `?${qs}` : ''}`
            },
            providesTags: (result) =>
                result
                    ? [
                          ...result.data.map((user) => ({ type: 'Users' as const, id: user.uuid })),
                          { type: 'Users' as const, id: 'LIST' }
                      ]
                    : [{ type: 'Users' as const, id: 'LIST' }]
        }),
        getSuggestedUsers: builder.query<GetListUserResType, GetSuggestedUsersQueryType | void>({
            query: (params) => {
                const qs = queryString.stringify(
                    { page: params?.page ?? 1, per_page: params?.per_page ?? 10, q: params?.q },
                    { skipNull: true, skipEmptyString: true }
                )
                return `${BACKEND_API_ENDPOINT.USER.SUGGESTED}${qs ? `?${qs}` : ''}`
            },
            providesTags: (result) =>
                result
                    ? [
                          ...result.data.map((user) => ({ type: 'Users' as const, id: user.uuid })),
                          { type: 'Users' as const, id: 'LIST' }
                      ]
                    : [{ type: 'Users' as const, id: 'LIST' }]
        }),
        followUser: builder.mutation<{ message: string }, FollowUserReqBodyType>({
            query: (body) => ({
                url: BACKEND_API_ENDPOINT.USER.FOLLOW(body.user_uuid),
                method: 'POST'
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Users', id: arg.user_uuid },
                { type: 'Users', id: 'LIST' }
            ]
        }),
        unfollowUser: builder.mutation<{ message: string }, string>({
            query: (user_uuid) => ({
                url: BACKEND_API_ENDPOINT.USER.FOLLOW(user_uuid),
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, user_uuid) => [
                { type: 'Users', id: user_uuid },
                { type: 'Users', id: 'LIST' }
            ]
        }),
        changePassword: builder.mutation<{ message: string }, ChangePasswordBodyType>({
            query: (data) => ({
                url: BACKEND_API_ENDPOINT.USER.CHANGE_PASSWORD,
                method: 'PUT',
                body: data
            })
        }),
        resendVerifyEmail: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: BACKEND_API_ENDPOINT.AUTH.RESEND_VERIFY_EMAIL,
                method: 'POST'
            })
        }),
        updateMe: builder.mutation<UpdateUserResType, UpdateUserBodyType>({
            query: (data) => ({
                url: BACKEND_API_ENDPOINT.USER.ME,
                method: 'PATCH',
                body: data
            }),
            invalidatesTags: (result) => (result ? [{ type: 'Users', id: result.data.uuid }] : [])
        }),
        getUserIndicator: builder.query<UserIndicatorsResponse, GetUserIndicatorQueryParamsType | void>({
            query: (params) => {
                const qs = params
                    ? `?${queryString.stringify({ fromDate: params.fromDate, toDate: params.toDate })}`
                    : ''
                return `${BACKEND_API_ENDPOINT.USER.INDICATORS}${qs}`
            },
            providesTags: (result, error, arg) =>
                result
                    ? [
                          {
                              type: 'UserIndicators',
                              id: `USER_INDICATOR-${arg?.fromDate || 'none'}-${arg?.toDate || 'none'}`
                          }
                      ]
                    : []
        }),
        getUserSettings: builder.query<GetUserSettingsResType, void>({
            query: () => ({ url: BACKEND_API_ENDPOINT.USER.SETTINGS, method: 'GET' }),
            providesTags: ['UserSettings']
        }),
        updateUserSettings: builder.mutation<UpdateUserSettingsResType, UpdateUserSettingsBodyType>({
            query: (data) => ({
                url: BACKEND_API_ENDPOINT.USER.SETTINGS,
                method: 'PATCH',
                body: data
            }),
            invalidatesTags: ['UserSettings']
        })
    })
})

export const {
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useVerifyForgotPasswordMutation,
    useGetMeQuery,
    useGetUserByUsernameQuery,
    useGetFollowersOfUserQuery,
    useGetFollowingOfUserQuery,
    useGetFriendsOfUserQuery,
    useGetSuggestedUsersQuery,
    useFollowUserMutation,
    useUnfollowUserMutation,
    useChangePasswordMutation,
    useResendVerifyEmailMutation,
    useUpdateMeMutation,
    useGetUserIndicatorQuery,
    useGetUserSettingsQuery,
    useUpdateUserSettingsMutation
} = UserApi
