import { BACKEND_API_ENDPOINT, NEXT_API_ENDPOINT } from '@/config/endpoint.config'
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
                url: NEXT_API_ENDPOINT.API_LOGIN,
                method: 'POST',
                body
            })
        }),
        logout: builder.mutation<LogoutResType, void>({
            query: () => ({
                url: NEXT_API_ENDPOINT.API_LOGOUT,
                method: 'POST'
            })
        }),
        register: builder.mutation<RegisterResponseType, RegisterReqBodyType>({
            query: (body) => ({
                url: NEXT_API_ENDPOINT.API_REGISTER,
                method: 'POST',
                body
            })
        }),
        refreshToken: builder.mutation<RefreshTokenRes, void>({
            query: () => ({
                url: NEXT_API_ENDPOINT.API_REFRESH_TOKEN,
                method: 'POST'
            })
        }),
        setCookie: builder.mutation<void, SetCookieBodyType>({
            query: (body) => ({
                url: NEXT_API_ENDPOINT.API_SET_TOKEN,
                method: 'POST',
                body
            })
        }),
        verifyEmail: builder.mutation<VerifyEmailResType, VerifyEmailReqBodyType>({
            query: (data) => ({
                url: BACKEND_API_ENDPOINT.API_VERIFY_EMAIL,
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
