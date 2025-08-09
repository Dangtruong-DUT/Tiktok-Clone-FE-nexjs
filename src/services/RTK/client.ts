import { fetchBaseQuery, retry } from "@reduxjs/toolkit/query";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Mutex } from "async-mutex";
import envConfig from "@/config/app.config";
import { loggedOut, tokenReceived } from "@/store/features/authSlice";
import { LoginResponseType } from "@/types/response/auth.type";
import { API_ENDPOINT } from "@/config/endpoint.config";
import { HTTP_STATUS } from "@/constants/http";

// create a new mutex
const mutex = new Mutex();
const baseQuery = fetchBaseQuery({ baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT });

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = retry(
    async (args, api, extraOptions) => {
        await mutex.waitForUnlock();
        let result = await baseQuery(args, api, extraOptions);
        if (result.error && result.error.status === HTTP_STATUS.UNAUTHORIZED) {
            if (!mutex.isLocked()) {
                const release = await mutex.acquire();
                try {
                    const refreshResult = await baseQuery(API_ENDPOINT.API_REFRESH_TOKEN, api, extraOptions);
                    const response = refreshResult.data as LoginResponseType;
                    if (response) {
                        const { access_token, refresh_token } = response.data;
                        api.dispatch(tokenReceived({ access_token, refresh_token }));
                        result = await baseQuery(args, api, extraOptions);
                    } else {
                        api.dispatch(loggedOut());
                    }
                } finally {
                    release();
                }
            } else {
                await mutex.waitForUnlock();
                result = await baseQuery(args, api, extraOptions);
            }
        }
        return result;
    },
    {
        maxRetries: 5,
    }
);

export default baseQueryWithReauth;
