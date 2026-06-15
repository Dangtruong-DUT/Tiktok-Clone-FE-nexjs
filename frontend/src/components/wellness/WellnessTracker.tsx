'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setPageType } from '@/store/features/wellnessSlice'
import { useScreenTimeTracker } from '@/hooks/wellness/useScreenTimeTracker'
import { WellnessAlertModal } from './WellnessAlertModal'

export function WellnessTracker() {
    const isAuthenticated = useAppSelector((s) => !!s.auth.isAuthenticated)
    const pathname = usePathname()
    const dispatch = useAppDispatch()

    useEffect(() => {
        const isAdminOrStudio = pathname.includes('/snapistudio') || pathname.includes('/admin')
        dispatch(setPageType(isAdminOrStudio ? 'other' : 'posts'))
    }, [pathname, dispatch])

    useScreenTimeTracker(isAuthenticated)

    return <WellnessAlertModal />
}
