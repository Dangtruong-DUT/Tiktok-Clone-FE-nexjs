import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { Mutex } from 'async-mutex'
import envConfig from '@/config/app.config'
import { NEXT_API_ENDPOINT } from '@/config/endpoint.config'
import { setLoggedOutAction } from '@/store/features/authSlice'
import { setLoggedOutAction } from '@/store/features/authSlice'
import { HTTP_STATUS } from '@/constants/api/http-status'

export const BackendBaseQuery = fetchBaseQuery({
    baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT,
    credentials: 'include'
})

export const BffBaseQuery = fetchBaseQuery({ baseUrl: '' })

const mutex = new Mutex()
const MAX_REFRESH_RETRIES = 2

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    await mutex.waitForUnlock()
    let result = await BackendBaseQuery(args, api, extraOptions)

    let refreshAttempts = 0

    while (result.error?.status === HTTP_STATUS.UNAUTHORIZED && refreshAttempts < MAX_REFRESH_RETRIES) {
        if (mutex.isLocked()) {
            await mutex.waitForUnlock()
            result = await BackendBaseQuery(args, api, extraOptions)
            refreshAttempts++
            continue
        }

        const release = await mutex.acquire()
        try {
            const refreshResult = await BffBaseQuery(
                { url: NEXT_API_ENDPOINT.API_REFRESH_TOKEN, method: 'POST' },
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

    if (result.error?.status === HTTP_STATUS.UNAUTHORIZED) {
        await BffBaseQuery({ url: NEXT_API_ENDPOINT.API_LOGOUT, method: 'POST' }, api, extraOptions)
        api.dispatch(setLoggedOutAction())
    }

    return result
}
const MAX_REFRESH_RETRIES = 2

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    await mutex.waitForUnlock()
    let result = await BackendBaseQuery(args, api, extraOptions)

    let refreshAttempts = 0

    while (result.error?.status === HTTP_STATUS.UNAUTHORIZED && refreshAttempts < MAX_REFRESH_RETRIES) {
        if (mutex.isLocked()) {
            await mutex.waitForUnlock()
            result = await BackendBaseQuery(args, api, extraOptions)
            refreshAttempts++
            continue
        }

        const release = await mutex.acquire()
        try {
            const refreshResult = await BffBaseQuery(
                { url: NEXT_API_ENDPOINT.API_REFRESH_TOKEN, method: 'POST' },
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

    if (result.error?.status === HTTP_STATUS.UNAUTHORIZED) {
        await BffBaseQuery({ url: NEXT_API_ENDPOINT.API_LOGOUT, method: 'POST' }, api, extraOptions)
        api.dispatch(setLoggedOutAction())
    }

    return result
}

export default baseQueryWithReauth
