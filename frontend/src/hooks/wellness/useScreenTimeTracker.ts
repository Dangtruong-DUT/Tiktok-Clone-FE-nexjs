'use client'

import { useCallback } from 'react'
import { useWellnessSession } from './useWellnessSession'
import { useSessionHeartbeat } from './useSessionHeartbeat'
import { useVideoTracker } from './useVideoTracker'
import { useStatsHydration } from './useStatsHydration'
import { useRuleMonitoring } from './useRuleMonitoring'
import { useTrackActionMutation } from '@/store/services/wellness/screen-time.service'

export function useScreenTimeTracker(isAuthenticated: boolean) {
    const { sessionUuid, sessionStartedAt } = useWellnessSession(isAuthenticated)

    useSessionHeartbeat(sessionUuid)
    useStatsHydration()
    useRuleMonitoring({ sessionUuid, sessionStartedAt })

    const { addVideoSeconds } = useVideoTracker(sessionUuid)
    const [trackActionMutation] = useTrackActionMutation()

    const trackAction = useCallback(
        (action: 'comment' | 'like' | 'post') => {
            if (!sessionUuid) return
            trackActionMutation({ uuid: sessionUuid, action })
        },
        [sessionUuid, trackActionMutation]
    )

    return { addVideoSeconds, trackAction }
}
