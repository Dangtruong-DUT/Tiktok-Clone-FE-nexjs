'use client'

import { useWellnessSession } from './useWellnessSession'
import { useSessionHeartbeat } from './useSessionHeartbeat'
import { useVideoTracker } from './useVideoTracker'
import { useStatsHydration } from './useStatsHydration'
import { useRuleMonitoring } from './useRuleMonitoring'

export function useScreenTimeTracker(isAuthenticated: boolean) {
    const { sessionUuid, sessionStartedAt } = useWellnessSession(isAuthenticated)

    useSessionHeartbeat(sessionUuid)
    useStatsHydration()
    useRuleMonitoring({ sessionUuid, sessionStartedAt })

    const { addVideoSeconds } = useVideoTracker(sessionUuid)

    return { addVideoSeconds }
}
