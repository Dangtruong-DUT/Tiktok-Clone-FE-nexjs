'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useLogoutMutation, useRefreshTokenMutation } from '@/store/services/auth.service'
import { APP_ROUTES } from '@/constants/routes/routes'
import { getSafeInternalRedirectPath } from '@/utils/auth/redirect-path.util'

export default function RefreshToken() {
    const [refreshToken] = useRefreshTokenMutation()
    const [logout] = useLogoutMutation()
    const router = useRouter()
    const searchParams = useSearchParams()
    const locale = useLocale()

    const redirectTo = useMemo(
        () => getSafeInternalRedirectPath(searchParams?.get('redirect') ?? null) || APP_ROUTES.HOME,
        [searchParams]
    )

    const handleRefreshToken = useCallback(async () => {
        try {
            await refreshToken().unwrap()
            router.replace(redirectTo)
        } catch (error) {
            await logout().unwrap()
            router.replace(APP_ROUTES.HOME)
        }
    }, [refreshToken, logout, router, redirectTo, locale])

    useEffect(() => {
        handleRefreshToken()
    }, [handleRefreshToken])

    return null
}
