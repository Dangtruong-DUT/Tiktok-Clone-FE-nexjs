'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setTodayStats } from '@/store/features/wellnessSlice'
import { useGetStatsQuery } from '@/store/services/wellness/screen-time.service'

export function useStatsHydration(): void {
    const dispatch = useAppDispatch()
    const isAuthenticated = useAppSelector((s) => !!s.auth.isAuthenticated)
    const { data: statsData } = useGetStatsQuery({ period: 'today' }, { skip: !isAuthenticated })

    useEffect(() => {
        if (statsData?.data) {
            dispatch(
                setTodayStats({
                    totalSeconds: statsData.data.total_seconds,
                    videoSeconds: statsData.data.video_seconds
                })
            )
        }
    }, [statsData, dispatch])
}
