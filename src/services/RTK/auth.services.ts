import { NextWithAuthBaseQuery } from "@/services/RTK/client";
import { LoginResponseType, LogoutResType, RegisterResponseType } from "@/types/response/auth.type";
import { LoginReqBodyType, LogoutReqBodyType, RegisterReqBodyType } from "@/utils/validations/auth.schema";
import { createApi } from "@reduxjs/toolkit/query/react";

export const AuthApi = createApi({
    baseQuery: NextWithAuthBaseQuery,
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponseType, LoginReqBodyType>({
            query: (body) => ({
                url: "/api/auth/login",
                method: "POST",
                body,
            }),
        }),
        logout: builder.mutation<LogoutResType, LogoutReqBodyType>({
            query: (body) => ({
                url: "/api/auth/logout",
                method: "POST",
                body,
            }),
        }),
        register: builder.mutation<RegisterResponseType, RegisterReqBodyType>({
            query: (body) => ({
                url: "/api/auth/register",
                method: "POST",
                body,
            }),
        }),
    }),
});

export const { useLoginMutation, useLogoutMutation, useRegisterMutation } = AuthApi;
