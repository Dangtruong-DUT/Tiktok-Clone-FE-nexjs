'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useLogoutMutation, useRefreshTokenMutation } from '@/store/services/auth.service'
import { AUTH_ROUTES, APP_ROUTES } from '@/constants/routes/routes'
import { getSafeInternalRedirectPath } from '@/utils/auth/redirect-path.util'
import { logger } from '@/utils/logger.util'

export default function RefreshToken() {
    const [refreshToken] = useRefreshTokenMutation()
    const [logout] = useLogoutMutation()
    const router = useRouter()
    const searchParams = useSearchParams()
    const locale = useLocale()
    const attempted = useRef(false)

    const redirectTo = useMemo(
        () => getSafeInternalRedirectPath(searchParams?.get('redirect') ?? null) || APP_ROUTES.HOME,
        [searchParams]
    )

    useEffect(() => {
        // Prevent double-invocation in React Strict Mode
        if (attempted.current) return
        attempted.current = true

        refreshToken()
            .unwrap()
            .then(() => router.replace(redirectTo))
            .catch(async () => {
                try {
                    await logout().unwrap()
                } catch (error) {
                    logger.error('Failed to logout after token refresh failure', error)
                }
                router.replace(`/${locale}${AUTH_ROUTES.LOGIN}?redirect=${redirectTo}`)
            })
    }, [refreshToken, logout, router, redirectTo, locale])

    return null
}
