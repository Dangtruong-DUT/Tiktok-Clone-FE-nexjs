'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setPageType } from '@/store/features/wellnessSlice'
import { useScreenTimeTracker } from '@/hooks/wellness/useScreenTimeTracker'
import { WellnessAlertModal } from './WellnessAlertModal'
import { WellnessContext } from '@/provider/wellness-context'

export function WellnessTracker({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAppSelector((s) => !!s.auth.isAuthenticated)
    const pathname = usePathname()
    const dispatch = useAppDispatch()

    useEffect(() => {
        const isVideoFeed =
            pathname === '/' ||
            pathname.endsWith('/following') ||
            pathname.endsWith('/friends')
        const isVideoDetail = /\/[^/]+\/video\/[^/]+/.test(pathname)
        dispatch(setPageType(isVideoFeed || isVideoDetail ? 'video' : 'other'))
    }, [pathname, dispatch])

    const { addVideoSeconds, trackAction } = useScreenTimeTracker(isAuthenticated)

    return (
        <WellnessContext.Provider value={{ reportVideoTime: addVideoSeconds, trackAction }}>
            {children}
            <WellnessAlertModal />
        </WellnessContext.Provider>
    )
}
