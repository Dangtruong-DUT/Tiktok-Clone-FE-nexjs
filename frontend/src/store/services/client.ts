import { fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { Mutex } from 'async-mutex'
import envConfig from '@/config/app.config'
import { NEXT_API_ENDPOINT } from '@/config/endpoint.config'
import { setLoggedOutAction, tokenReceived } from '@/store/features/authSlice'
import { RefreshTokenRes } from '@/types/dtos/auth/auth-response.dto'
import { HTTP_STATUS } from '@/constants/http'
import { RootState } from '@/store'

/**
 * Base query for backend API requests.
 * It automatically includes the access token in the headers if it exists in the state.
 */
export const BackendBaseQuery = fetchBaseQuery({
    baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT,
    prepareHeaders: async (headers, api) => {
        if (headers.has('authorization')) return headers

        const token = (api.getState() as RootState).auth.access_token
        if (token) {
            headers.set('authorization', `Bearer ${token}`)
        }
        return headers
    }
})

/**
 * Nextjs server for handle public api route, it will forward the request to backend server and return the response to client.
 * This is used to handle the case when we want to set httpOnly cookie for refresh token, which can only be set from server side.
 * So we need to forward the request to backend server and set the cookie from there.
 */
export const NextWithAuthBaseQuery = fetchBaseQuery({ baseUrl: '' })

const mutex = new Mutex()

/**
 * A custom base query that handles token refresh logic.
 * It checks if the access token is expired and attempts to refresh it using the refresh token.
 * If the refresh is successful, it retries the original request with the new access token.
 * If the refresh fails, it dispatches a logout action.
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = retry(
    async (args, api, extraOptions) => {
        await mutex.waitForUnlock()
        let result = await BackendBaseQuery(args, api, extraOptions)
        if (result.error && result.error.status === HTTP_STATUS.UNAUTHORIZED) {
            if (!mutex.isLocked()) {
                const release = await mutex.acquire()
                try {
                    const refreshResult = await NextWithAuthBaseQuery(
                        { url: NEXT_API_ENDPOINT.API_REFRESH_TOKEN, method: 'POST' },
                        api,
                        extraOptions
                    )
                    const response = refreshResult.data as RefreshTokenRes
                    if (response) {
                        const { access_token, refresh_token } = response.data
                        api.dispatch(tokenReceived({ access_token, refresh_token }))
                        result = await BackendBaseQuery(args, api, extraOptions)
                    } else {
                        await NextWithAuthBaseQuery(
                            { url: NEXT_API_ENDPOINT.API_LOGOUT, method: 'POST' },
                            api,
                            extraOptions
                        )
                        api.dispatch(setLoggedOutAction())
                    }
                } finally {
                    release()
                }
            } else {
                await mutex.waitForUnlock()
                result = await BackendBaseQuery(args, api, extraOptions)
            }
        }
        return result
    },
    {
        maxRetries: 1
    }
)

export default baseQueryWithReauth
