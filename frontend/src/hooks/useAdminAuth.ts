'use client'

import { useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'
import { useLocale } from 'next-intl'
import { redirect } from 'next/navigation'
import { Role } from '@/constants/enum'

/**
 * useAdminAuth - Hook to verify admin role and redirect if unauthorized
 * Must be used in client components
 *
 * Usage:
 *   export default function AdminPage() {
 *     const { isAdmin } = useAdminAuth()
 *     if (!isAdmin) return null // Loading state
 *     return <AdminContent />
 *   }
 */
export function useAdminAuth() {
    const { role } = useAppSelector((state) => state.auth)
    const locale = useLocale()

    const isAdmin = role === Role.SUPER_ADMIN

    useEffect(() => {
        if (role !== undefined && !isAdmin) {
            // Redirect non-admin users to home
            redirect(`/${locale}`)
        }
    }, [isAdmin, role, locale])

    return {
        isAdmin,
        isLoading: role === undefined
    }
}
