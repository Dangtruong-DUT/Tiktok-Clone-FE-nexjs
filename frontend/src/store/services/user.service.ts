import { BACKEND_API_ENDPOINT } from '@/config/endpoint.config'
import baseQueryWithReauth from '@/store/services/client'
import { UserIndicatorsResponse } from '@/types/dtos/stats/stats-response.dto'
import { GetUserProfileResType, UpdateUserResType } from '@/types/dtos/user/user-response.dto'
import {
    ForgotPasswordReqBodyType,
    ResetPasswordReqBodyType,
    verifyForgotPasswordReqBodyType
} from '@/types/dtos/auth/auth-request.dto'
import {
    ChangePasswordBodyType,
    FollowUserReqBodyType,
    GetUserIndicatorQueryParamsType,
    UpdateUserBodyType
} from '@/types/dtos/user/user-request.dto'
import { createApi } from '@reduxjs/toolkit/query/react'
import queryString from 'query-string'

export const UserApi = createApi({
    reducerPath: 'UserApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Users', 'UserIndicators'],
    refetchOnMountOrArgChange: false,
    keepUnusedDataFor: 60,
    refetchOnFocus: false,
    refetchOnReconnect: true,
    endpoints: (builder) => ({
        forgotPassword: builder.mutation<{ message: string }, ForgotPasswordReqBodyType>({
            query: (data) => ({
                url: BACKEND_API_ENDPOINT.API_FORGOT_PASSWORD,
                method: 'POST',
                body: data
            })
        }),
        verifyForgotPassword: builder.mutation<{ message: string }, verifyForgotPasswordReqBodyType>({
            query: (data) => ({
                url: BACKEND_API_ENDPOINT.API_VERIFY_FORGOT_PASSWORD,
                method: 'POST',
                body: data
            })
        }),
        resetPassword: builder.mutation<{ message: string }, ResetPasswordReqBodyType>({
            query: (data) => ({
                url: BACKEND_API_ENDPOINT.API_RESET_PASSWORD,
                method: 'POST',
                body: data
            })
        }),
        getMe: builder.query<GetUserProfileResType, void>({
            query: () => ({
                url: BACKEND_API_ENDPOINT.API_GET_ME,
                method: 'GET'
            }),
            providesTags: (result) => (result ? [{ type: 'Users', id: result.data.uuid }] : [])
        }),
        getUserByUsername: builder.query<GetUserProfileResType, string>({
            query: (username) => ({
                url: `/users/${username}`,
                method: 'GET'
            }),
            providesTags: (result) => (result ? [{ type: 'Users', id: result.data.uuid }] : [])
        }),
        followUser: builder.mutation<{ message: string }, FollowUserReqBodyType>({
            query: (body) => ({
                url: `/users/${body.user_uuid}/follow`,
                method: 'POST'
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Users', id: arg.user_uuid },
                { type: 'Users', id: 'LIST' }
            ]
        }),
        unfollowUser: builder.mutation<{ message: string }, string>({
            query: (user_uuid) => ({
                url: `/users/${user_uuid}/follow`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, user_uuid) => [
                { type: 'Users', id: user_uuid },
                { type: 'Users', id: 'LIST' }
            ]
        }),
        changePassword: builder.mutation<{ message: string }, ChangePasswordBodyType>({
            query: (data) => ({
                url: `/users/change-password`,
                method: 'PUT',
                body: data
            })
        }),
        resendVerifyEmail: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: BACKEND_API_ENDPOINT.API_RESEND_VERIFY_EMAIL,
                method: 'POST'
            })
        }),
        updateMe: builder.mutation<UpdateUserResType, UpdateUserBodyType>({
            query: (data) => ({
                url: `/users/me`,
                method: 'PATCH',
                body: data
            }),
            invalidatesTags: (result) => (result ? [{ type: 'Users', id: result.data.uuid }] : [])
        }),
        getUserIndicator: builder.query<UserIndicatorsResponse, GetUserIndicatorQueryParamsType | void>({
            query: (params) => {
                const query = params
                    ? `?${queryString.stringify({
                          fromDate: params.fromDate,
                          toDate: params.toDate
                      })}`
                    : ''

                return {
                    url: `/users/me/indicators${query}`,
                    method: 'GET'
                }
            },
            providesTags: (result, error, arg) => {
                return result
                    ? [
                          {
                              type: 'UserIndicators',
                              id: `USER_INDICATOR-${arg?.fromDate || 'none'}-${arg?.toDate || 'none'}`
                          }
                      ]
                    : []
            }
        })
    })
})

export const {
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useVerifyForgotPasswordMutation,
    useGetMeQuery,
    useGetUserByUsernameQuery,
    useFollowUserMutation,
    useUnfollowUserMutation,
    useChangePasswordMutation,
    useResendVerifyEmailMutation,
    useUpdateMeMutation,
    useGetUserIndicatorQuery
} = UserApi
