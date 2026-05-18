'use client'

import { handleRefreshToken } from '@/lib/auth'
import { useLogoutMutation } from '@/store/services/auth.service'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useEffect } from 'react'
import { logger } from '@/utils/logger'

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
                router.replace(redirectPath)
            },
            onError: async (error) => {
                logger.error('Token refresh failed:', error)
                try {
                    await logoutMutate().unwrap()
                } catch {
                }
                router.replace(`/${locale}/login`)
            }
        })
    }, [router, redirectPath, logoutMutate, locale])

    return null
}
