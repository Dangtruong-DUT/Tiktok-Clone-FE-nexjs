'use client'

import { useLogoutMutation, useRefreshTokenMutation } from '@/store/services/auth.service'
import { useEffect, useRef } from 'react'
import { getClientAccessTokenTimes } from '@/utils/auth/cookies.util'
import { useAppSelector } from '@/store/hooks'
import { logger } from '@/utils/logger.util'

const CHECK_INTERVAL_MS = 30_000

export function useProactiveTokenRefresh() {
    const [refreshToken] = useRefreshTokenMutation()
    const [logout] = useLogoutMutation()
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
    const isRefreshing = useRef(false)

    useEffect(() => {
        async function checkAndRefresh() {
            if (!isAuthenticated) return
            if (isRefreshing.current) return

            const { iat, exp } = getClientAccessTokenTimes()
            if (!iat || !exp) return

            const nowSeconds = Math.floor(Date.now() / 1000)
            if (nowSeconds >= exp) return

            const lifetime = exp - iat
            const refreshAt = exp - Math.floor(lifetime / 3)
            if (nowSeconds < refreshAt) return

            isRefreshing.current = true
            try {
                await refreshToken().unwrap()
            } catch {
                try {
                    await logout().unwrap()
                } catch (e) {
                    logger.error('Failed to refresh token and logout', e)
                }
            } finally {
                isRefreshing.current = false
            }
        }

        checkAndRefresh()
        const interval = setInterval(checkAndRefresh, CHECK_INTERVAL_MS)

        return () => clearInterval(interval)
    }, [refreshToken, logout, isAuthenticated, isRefreshing])
}
