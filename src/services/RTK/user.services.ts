import { API_ENDPOINT } from "@/config/endpoint.config";
import baseQueryWithReauth from "@/services/RTK/client";
import { VerifyEmailResType } from "@/types/response/user.type";
import {
    ForgotPasswordReqBodyType,
    ResetPasswordReqBodyType,
    verifyForgotPasswordReqBodyType,
} from "@/utils/validations/auth.schema";
import { VerifyEmailReqBodyType } from "@/utils/validations/user.schema";
import { createApi } from "@reduxjs/toolkit/query/react";

export const UserApi = createApi({
    reducerPath: "UserApi",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        verify: builder.mutation<VerifyEmailResType, VerifyEmailReqBodyType>({
            query: (data) => ({
                url: API_ENDPOINT.API_VERIFY_EMAIL,
                method: "POST",
                body: data,
            }),
        }),
        forgotPassword: builder.mutation<{ message: string }, ForgotPasswordReqBodyType>({
            query: (data) => ({
                url: API_ENDPOINT.API_FORGOT_PASSWORD,
                method: "POST",
                body: data,
            }),
        }),
        verifyForgotPassword: builder.mutation<{ message: string }, verifyForgotPasswordReqBodyType>({
            query: (data) => ({
                url: API_ENDPOINT.API_VERIFY_FORGOT_PASSWORD,
                method: "POST",
                body: data,
            }),
        }),
        resetPassword: builder.mutation<{ message: string }, ResetPasswordReqBodyType>({
            query: (data) => ({
                url: API_ENDPOINT.API_RESET_PASSWORD,
                method: "POST",
                body: data,
            }),
        }),
    }),
});

export const {
    useVerifyMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useVerifyForgotPasswordMutation,
} = UserApi;
