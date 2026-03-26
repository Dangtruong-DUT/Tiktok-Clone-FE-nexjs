import { API_ENDPOINT } from '@/config/endpoint.config'
import { NextWithAuthBaseQuery } from '@/store/services/client'
import { SetCookieBodyType } from '@/types/auth'
import { LoginResponseType, LogoutResType, RefreshTokenRes, RegisterResponseType } from '@/types/dtos/auth/auth-response.dto'
import { VerifyEmailResType } from '@/types/dtos/user/user-response.dto'
import { LoginReqBodyType, RegisterReqBodyType } from '@/types/dtos/auth/auth-request.dto'
import { VerifyEmailReqBodyType } from '@/types/dtos/user/user-request.dto'
import { createApi } from '@reduxjs/toolkit/query/react'

export const AuthApi = createApi({
    baseQuery: NextWithAuthBaseQuery,
    reducerPath: 'AuthApi',
    refetchOnReconnect: true,
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponseType, LoginReqBodyType>({
            query: (body) => ({
                url: '/api/auth/login',
                method: 'POST',
                body
            })
        }),
        logout: builder.mutation<LogoutResType, void>({
            query: () => ({
                url: '/api/auth/logout',
                method: 'POST'
            })
        }),
        register: builder.mutation<RegisterResponseType, RegisterReqBodyType>({
            query: (body) => ({
                url: '/api/auth/register',
                method: 'POST',
                body
            })
        }),
        refreshToken: builder.mutation<RefreshTokenRes, void>({
            query: () => ({
                url: '/api/auth/refresh-token',
                method: 'POST'
            })
        }),
        setCookie: builder.mutation<void, SetCookieBodyType>({
            query: (body) => ({
                url: '/api/auth/token',
                method: 'POST',
                body
            })
        }),
        verifyEmail: builder.mutation<VerifyEmailResType, VerifyEmailReqBodyType>({
            query: (data) => ({
                url: API_ENDPOINT.API_VERIFY_EMAIL,
                method: 'POST',
                body: data
            })
        })
    })
})

export const {
    useLoginMutation,
    useLogoutMutation,
    useRegisterMutation,
    useRefreshTokenMutation,
    useSetCookieMutation,
    useVerifyEmailMutation
} = AuthApi
