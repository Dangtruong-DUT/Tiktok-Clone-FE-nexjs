'use client'

import { useAppSelector } from '@/store/hooks'
import { useScreenTimeTracker } from '@/hooks/wellness/useScreenTimeTracker'
import { WellnessAlertModal } from './WellnessAlertModal'

export function WellnessTracker() {
    const isAuthenticated = useAppSelector((s) => !!s.auth.isAuthenticated)

    useScreenTimeTracker(isAuthenticated)

    return <WellnessAlertModal />
}
