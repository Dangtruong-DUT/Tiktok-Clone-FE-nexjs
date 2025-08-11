import { API_ENDPOINT } from "@/config/endpoint.config";
import baseQueryWithReauth from "@/services/RTK/client";
import { VerifyEmailResType } from "@/types/response/user.type";
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
    }),
});

export const { useVerifyMutation } = UserApi;
