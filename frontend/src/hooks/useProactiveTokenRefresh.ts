'use client'

import { useLogoutMutation, useRefreshTokenMutation } from '@/store/services/auth.service'
import { useEffect, useRef } from 'react'
import { AUTH_COOKIE } from '@/constants/auth'

const REFRESH_BUFFER_SECONDS = 120

function getAccessTokenExp(): number {
    if (typeof document === 'undefined') return 0
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE.ACCESS_TOKEN_EXP}=([^;]+)`))
    return match?.[1] ? parseInt(match[1], 10) : 0
}

export function useProactiveTokenRefresh() {
    const [refreshToken] = useRefreshTokenMutation()
    const [logout] = useLogoutMutation()
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        function scheduleRefresh() {
            if (timerRef.current) clearTimeout(timerRef.current)

            const exp = getAccessTokenExp()
            if (!exp) return

            const nowSeconds = Math.floor(Date.now() / 1000)
            const secondsUntilRefresh = exp - nowSeconds - REFRESH_BUFFER_SECONDS

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
                } catch {
                    // ignore logout errors
                }
            }
        }

        scheduleRefresh()

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [refreshToken, logout])
}
