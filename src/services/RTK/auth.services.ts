import { API_ENDPOINT } from "@/config/endpoint.config";
import baseQueryCustom from "@/services/RTK/client";
import { LoginResponseType, LogoutResType, RegisterResponseType } from "@/types/response/auth.type";
import { LoginReqBodyType, LogoutReqBodyType, RegisterReqBodyType } from "@/utils/validations/auth.schema";
import { createApi } from "@reduxjs/toolkit/query/react";

export const AuthApi = createApi({
    baseQuery: baseQueryCustom,
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponseType, LoginReqBodyType>({
            query: (body) => ({
                url: API_ENDPOINT.API_LOGIN,
                method: "POST",
                body,
            }),
        }),
        logout: builder.mutation<LogoutResType, LogoutReqBodyType>({
            query: (body) => ({
                url: API_ENDPOINT.API_LOGOUT,
                method: "POST",
                body,
            }),
        }),
        register: builder.mutation<RegisterResponseType, RegisterReqBodyType>({
            query: (body) => ({
                url: API_ENDPOINT.API_REGISTER,
                method: "POST",
                body,
            }),
        }),
    }),
});

export const { useLoginMutation, useLogoutMutation, useRegisterMutation } = AuthApi;
