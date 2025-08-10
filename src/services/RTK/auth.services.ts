import { NextWithAuthBaseQuery } from "@/services/RTK/client";
import { LoginResponseType, LogoutResType, RefreshTokenRes, RegisterResponseType } from "@/types/response/auth.type";
import { LoginReqBodyType, RegisterReqBodyType } from "@/utils/validations/auth.schema";
import { createApi } from "@reduxjs/toolkit/query/react";

export const AuthApi = createApi({
    baseQuery: NextWithAuthBaseQuery,
    reducerPath: "AuthApi",
    refetchOnReconnect: true,
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponseType, LoginReqBodyType>({
            query: (body) => ({
                url: "/api/auth/login",
                method: "POST",
                body,
            }),
        }),
        logout: builder.mutation<LogoutResType, void>({
            query: () => ({
                url: "/api/auth/logout",
                method: "POST",
            }),
        }),
        register: builder.mutation<RegisterResponseType, RegisterReqBodyType>({
            query: (body) => ({
                url: "/api/auth/register",
                method: "POST",
                body,
            }),
        }),
        refreshToken: builder.mutation<RefreshTokenRes, void>({
            query: () => ({
                url: "/api/auth/refresh-token",
                method: "POST",
            }),
        }),
    }),
});

export const { useLoginMutation, useLogoutMutation, useRegisterMutation, useRefreshTokenMutation } = AuthApi;
