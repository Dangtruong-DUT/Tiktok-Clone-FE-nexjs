import { API_ENDPOINT } from "@/config/endpoint.config";
import baseQueryWithReauth from "@/services/RTK/client";
import { UserIndicatorsResponse } from "@/types/response/stats.type";
import { GetUserProfileResType, UpdateUserResType, VerifyEmailResType } from "@/types/response/user.type";
import {
    ForgotPasswordReqBodyType,
    ResetPasswordReqBodyType,
    verifyForgotPasswordReqBodyType,
} from "@/utils/validations/auth.schema";
import {
    ChangePasswordBodyType,
    FollowUserReqBodyType,
    GetUserIndicatorQueryParamsType,
    UpdateUserBodyType,
    VerifyEmailReqBodyType,
} from "@/utils/validations/user.schema";
import { createApi } from "@reduxjs/toolkit/query/react";
import queryString from "query-string";

export const UserApi = createApi({
    reducerPath: "UserApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Users", "UserIndicators"],
    refetchOnMountOrArgChange: false,
    keepUnusedDataFor: 60,
    refetchOnFocus: false,
    refetchOnReconnect: true,
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
        getMe: builder.query<GetUserProfileResType, void>({
            query: () => ({
                url: API_ENDPOINT.API_GET_ME,
                method: "GET",
            }),
            providesTags: (result) => (result ? [{ type: "Users", id: result.data._id }] : []),
        }),
        getUserByUsername: builder.query<GetUserProfileResType, string>({
            query: (username) => ({
                url: `/users/${username}`,
                method: "GET",
            }),
            providesTags: (result) => (result ? [{ type: "Users", id: result.data._id }] : []),
        }),
        followUser: builder.mutation<{ message: string }, FollowUserReqBodyType>({
            query: (body) => ({
                url: `/users/follow`,
                method: "POST",
                body,
            }),
            invalidatesTags: (result, error, arg) => [
                { type: "Users", id: arg.user_id },
                { type: "Users", id: "LIST" },
            ],
        }),
        unfollowUser: builder.mutation<{ message: string }, string>({
            query: (user_id) => ({
                url: `/users/follow/${user_id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, user_id) => [
                { type: "Users", id: user_id },
                { type: "Users", id: "LIST" },
            ],
        }),
        changePassword: builder.mutation<{ message: string }, ChangePasswordBodyType>({
            query: (data) => ({
                url: `/users/change-password`,
                method: "PUT",
                body: data,
            }),
        }),
        updateMe: builder.mutation<UpdateUserResType, UpdateUserBodyType>({
            query: (data) => ({
                url: `/users/me`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: (result, error, arg) => (result ? [{ type: "Users", id: result.data._id }] : []),
        }),
        getUserIndicator: builder.query<UserIndicatorsResponse, GetUserIndicatorQueryParamsType | void>({
            query: (params) => {
                const query = params
                    ? `?${queryString.stringify({
                          fromDate: params.fromDate,
                          toDate: params.toDate,
                      })}`
                    : "";

                return {
                    url: `/users/me/indicators${query}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, arg) => {
                return result
                    ? [
                          {
                              type: "UserIndicators",
                              id: `USER_INDICATOR-${arg?.fromDate || "none"}-${arg?.toDate || "none"}`,
                          },
                      ]
                    : [];
            },
        }),
    }),
});

export const {
    useVerifyMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useVerifyForgotPasswordMutation,
    useGetMeQuery,
    useGetUserByUsernameQuery,
    useFollowUserMutation,
    useUnfollowUserMutation,
    useChangePasswordMutation,
    useUpdateMeMutation,
    useGetUserIndicatorQuery,
} = UserApi;
