import { NEXT_API_ENDPOINT } from '@/constants/api/endpoints'
import { BffBaseQuery } from '@/store/services/client'
import {
    LoginResponseType,
    LogoutResType,
    RefreshTokenRes,
    RegisterResponseType
} from '@/types/dtos/auth/auth-response.dto'
import { VerifyEmailResType } from '@/types/dtos/user/user-response.dto'
import { LoginReqBodyType, RegisterReqBodyType } from '@/types/dtos/auth/auth-request.dto'
import { VerifyEmailReqBodyType } from '@/types/dtos/user/user-request.dto'
import { createApi } from '@reduxjs/toolkit/query/react'

export const AuthApi = createApi({
    baseQuery: BffBaseQuery,
    reducerPath: 'AuthApi',
    refetchOnReconnect: true,
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponseType, LoginReqBodyType>({
            query: (body) => ({
                url: NEXT_API_ENDPOINT.AUTH.LOGIN,
                method: 'POST',
                body
            })
        }),
        logout: builder.mutation<LogoutResType, void>({
            query: () => ({
                url: NEXT_API_ENDPOINT.AUTH.LOGOUT,
                method: 'POST'
            })
        }),
        register: builder.mutation<RegisterResponseType, RegisterReqBodyType>({
            query: (body) => ({
                url: NEXT_API_ENDPOINT.AUTH.REGISTER,
                method: 'POST',
                body
            })
        }),
        refreshToken: builder.mutation<RefreshTokenRes, void>({
            query: () => ({
                url: NEXT_API_ENDPOINT.AUTH.REFRESH_TOKEN,
                method: 'POST'
            })
        }),
        verifyEmail: builder.mutation<VerifyEmailResType, VerifyEmailReqBodyType>({
            query: (data) => ({
                url: NEXT_API_ENDPOINT.AUTH.VERIFY_EMAIL,
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
    useVerifyEmailMutation
} = AuthApi
