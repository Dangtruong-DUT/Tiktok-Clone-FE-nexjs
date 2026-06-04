import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { Mutex } from 'async-mutex'
import envConfig from '@/config/app.config'
import { NEXT_API_ENDPOINT } from '@/constants/api/endpoints'
import { setLoggedOutAction } from '@/store/features/authSlice'
import type { RootState } from '@/store'
import { HTTP_STATUS } from '@/constants/api/http-status'
import { getExponentialBackoffDelay, sleep } from '@/utils/backoff.util'

const SUPPORTED_LOCALES = ['vi', 'en'] as const

function getLocaleFromPath(): string {
    if (typeof window === 'undefined') return 'vi'
    const segment = window.location.pathname.split('/')[1] ?? ''
    return (SUPPORTED_LOCALES as readonly string[]).includes(segment) ? segment : 'vi'
}

export const BackendBaseQuery = fetchBaseQuery({
    baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT,
    credentials: 'include',
    prepareHeaders: (headers) => {
        headers.set('X-Locale', getLocaleFromPath())
        return headers
    }
})

export const BffBaseQuery = fetchBaseQuery({ baseUrl: '' })

const mutex = new Mutex()
const MAX_REFRESH_RETRIES = 3

function getRequestUrl(args: string | FetchArgs): string {
    return typeof args === 'string' ? args : args.url
}

function shouldSkipReauth(args: string | FetchArgs, state: RootState): boolean {
    const requestUrl = getRequestUrl(args)
    const isAuthRoute =
        requestUrl === NEXT_API_ENDPOINT.AUTH.LOGOUT || requestUrl === NEXT_API_ENDPOINT.AUTH.REFRESH_TOKEN

    return isAuthRoute || !state.auth.isAuthenticated
}

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    await mutex.waitForUnlock()
    let result = await BackendBaseQuery(args, api, extraOptions)
    const state = api.getState() as RootState

    if (result.error?.status === HTTP_STATUS.UNAUTHORIZED && shouldSkipReauth(args, state)) {
        // Only call logout if the user is currently considered authenticated.
        // When already logged out, successive 401s from stale pollers must not
        // trigger another logout round-trip (which causes an infinite loop).
        if (state.auth.isAuthenticated) {
            await BffBaseQuery({ url: NEXT_API_ENDPOINT.AUTH.LOGOUT, method: 'POST' }, api, extraOptions)
            api.dispatch(setLoggedOutAction())
        }
        return result
    }

    let refreshAttempts = 0

    while (result.error?.status === HTTP_STATUS.UNAUTHORIZED && refreshAttempts < MAX_REFRESH_RETRIES) {
        const delay = getExponentialBackoffDelay(refreshAttempts)
        await sleep(delay)

        if (mutex.isLocked()) {
            await mutex.waitForUnlock()
            result = await BackendBaseQuery(args, api, extraOptions)
            refreshAttempts++
            continue
        }

        const release = await mutex.acquire()
        try {
            const refreshResult = await BffBaseQuery(
                { url: NEXT_API_ENDPOINT.AUTH.REFRESH_TOKEN, method: 'POST' },
                api,
                extraOptions
            )

            if (refreshResult.data) {
                result = await BackendBaseQuery(args, api, extraOptions)
            } else {
                break
            }
        } finally {
            release()
        }

        refreshAttempts++
    }

    if (result.error?.status === HTTP_STATUS.UNAUTHORIZED && state.auth.isAuthenticated) {
        await BffBaseQuery({ url: NEXT_API_ENDPOINT.AUTH.LOGOUT, method: 'POST' }, api, extraOptions)
        api.dispatch(setLoggedOutAction())
    }

    return result
}

export default baseQueryWithReauth
