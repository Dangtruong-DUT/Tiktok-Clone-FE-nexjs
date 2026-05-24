'use client'

import { useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'
import { useAppContext } from '@/provider/app-provider'
import { useLocale } from 'next-intl'
import { Role } from '@/constants/enum'
import { useRouter } from '@/i18n/navigation'

export function useAdminAuth() {
    const { role, isAuthenticated } = useAppSelector((state) => state.auth)
    const { authStatus } = useAppContext()
    const router = useRouter()
    const locale = useLocale()

    const isAdmin = role === Role.SUPER_ADMIN

    useEffect(() => {
        if (authStatus !== 'ready') return
        if (!isAuthenticated || !isAdmin) {
            router.replace(`/${locale}`)
        }
    }, [isAdmin, isAuthenticated, authStatus, locale, router])

    return {
        isAdmin,
        isLoading: authStatus !== 'ready'
    }
}
