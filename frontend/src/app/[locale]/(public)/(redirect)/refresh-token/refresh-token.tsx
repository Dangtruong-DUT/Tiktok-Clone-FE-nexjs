'use client'

import { handleRefreshToken } from '@/lib/auth'
import { useLogoutMutation } from '@/store/services/auth.service'
import { logger } from '@/utils/logger'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RefreshTokenProps {
    redirectPath: string
}

export default function RefreshToken({ redirectPath }: RefreshTokenProps) {
    const router = useRouter()
    const locale = useLocale()
    const [logoutMutate] = useLogoutMutation()

    useEffect(() => {
        handleRefreshToken({
            onSuccess: () => {
                // Force full page reload so the server layout re-reads the new
                // access_token cookie and sets initialAuthenticated=true,
                // which triggers getMe and restores isAuthenticated in Redux.
                window.location.replace(redirectPath)
            },
            onError: async (error) => {
                try {
                    await logoutMutate().unwrap()
                } catch {
                    logger.error('Failed to logout after refresh token failure', error)
                }
                router.replace(`/${locale}/login`)
            }
        })
    }, [router, redirectPath, logoutMutate, locale])

    return null
}
