import { fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import envConfig from "@/config/app.config";
import { setLoggedOutAction, tokenReceived } from "@/store/features/authSlice";
import { RefreshTokenRes } from "@/types/response/auth.type";
import { HTTP_STATUS } from "@/constants/http";
import { RootState } from "@/store";

// create a new mutex
const mutex = new Mutex();
//backend server
export const BackendBaseQuery = fetchBaseQuery({
    baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT,
    prepareHeaders: async (headers, api) => {
        if (headers.has("authorization")) return headers;

        const token = (api.getState() as RootState).auth.access_token;
        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
    },
});
//proxy server manager auth for nextjs
export const NextWithAuthBaseQuery = fetchBaseQuery({ baseUrl: "" });

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = retry(
    async (args, api, extraOptions) => {
        await mutex.waitForUnlock();
        let result = await BackendBaseQuery(args, api, extraOptions);
        if (result.error && result.error.status === HTTP_STATUS.UNAUTHORIZED) {
            if (!mutex.isLocked()) {
                const release = await mutex.acquire();
                try {
                    const refreshResult = await NextWithAuthBaseQuery(
                        { url: "/api/auth/refresh-token", method: "POST" },
                        api,
                        extraOptions
                    );
                    const response = refreshResult.data as RefreshTokenRes;
                    if (response) {
                        const { access_token, refresh_token } = response.data;
                        api.dispatch(tokenReceived({ access_token, refresh_token }));
                        result = await BackendBaseQuery(args, api, extraOptions);
                    } else {
                        await NextWithAuthBaseQuery({ url: "/api/auth/logout", method: "POST" }, api, extraOptions);
                        api.dispatch(setLoggedOutAction());
                    }
                } finally {
                    release();
                }
            } else {
                await mutex.waitForUnlock();
                result = await BackendBaseQuery(args, api, extraOptions);
            }
        }
        return result;
    },
    {
        maxRetries: 5,
    }
);

export default baseQueryWithReauth;
