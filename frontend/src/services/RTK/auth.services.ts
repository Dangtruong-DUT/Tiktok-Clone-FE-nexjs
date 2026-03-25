import { API_ENDPOINT } from '@/config/endpoint.config'
import { NextWithAuthBaseQuery } from '@/services/RTK/client'
import { SetCookieBodyType } from '@/types/auth'
import { LoginResponseType, LogoutResType, RefreshTokenRes, RegisterResponseType } from '@/types/response/auth.type'
import { VerifyEmailResType } from '@/types/response/user.type'
import { LoginReqBodyType, RegisterReqBodyType } from '@/utils/validations/auth.schema'
import { VerifyEmailReqBodyType } from '@/utils/validations/user.schema'
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
