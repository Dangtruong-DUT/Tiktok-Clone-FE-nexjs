'use client'

import { useLogoutMutation, useRefreshTokenMutation } from '@/store/services/auth.service'
import { useEffect, useRef } from 'react'
import { AUTH_COOKIE } from '@/constants/auth'
import { logger } from '@/utils/logger.util'

function getAccessTokenTimes(): { iat: number; exp: number } {
    if (typeof document === 'undefined') return { iat: 0, exp: 0 }
    const getCookie = (name: string) => {
        const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
        return match?.[1] ? parseInt(match[1], 10) : 0
    }
    return {
        iat: getCookie(AUTH_COOKIE.ACCESS_TOKEN_IAT),
        exp: getCookie(AUTH_COOKIE.ACCESS_TOKEN_EXP)
    }
}

export function useProactiveTokenRefresh() {
    const [refreshToken] = useRefreshTokenMutation()
    const [logout] = useLogoutMutation()
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        /**
         * Schedules a token refresh to occur at 2/3 of the access token's lifetime.
         * If the refresh fails, it will attempt to log the user out.
         */
        function scheduleRefresh() {
            if (timerRef.current) clearTimeout(timerRef.current)

            const { iat, exp } = getAccessTokenTimes()
            if (!exp || !iat) return

            const nowSeconds = Math.floor(Date.now() / 1000)
            const lifetime = exp - iat
            const refreshAt = exp - Math.floor(lifetime / 3)
            const secondsUntilRefresh = refreshAt - nowSeconds

            if (secondsUntilRefresh <= 0) {
                doRefresh()
                return
            }

            timerRef.current = setTimeout(doRefresh, secondsUntilRefresh * 1000)
        }

        async function doRefresh() {
            try {
                await refreshToken().unwrap()
                scheduleRefresh()
            } catch {
                try {
                    await logout().unwrap()
                } catch (e) {
                    logger.error('Failed to refresh token and logout', e)
                }
            }
        }

        scheduleRefresh()

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [refreshToken, logout])
}
