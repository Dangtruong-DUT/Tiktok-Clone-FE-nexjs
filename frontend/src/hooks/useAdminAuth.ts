'use client'

import { useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'
import { useLocale } from 'next-intl'
import { redirect } from 'next/navigation'
import { Role } from '@/constants/enum'

export function useAdminAuth() {
    const { role } = useAppSelector((state) => state.auth)
    const locale = useLocale()

    const isAdmin = role === Role.SUPER_ADMIN

    useEffect(() => {
        if (role !== undefined && !isAdmin) {
            redirect(`/${locale}`)
        }
    }, [isAdmin, role, locale])

    return {
        isAdmin,
        isLoading: role === undefined
    }
}
