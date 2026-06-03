'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
    setSession,
    clearSession,
    showAlert,
    setTodayStats,
    addVideoSeconds,
} from '@/store/features/wellnessSlice'
import {
    useStartSessionMutation,
    useSendHeartbeatMutation,
    useUpdateVideoTimeMutation,
    useEndSessionMutation,
    useGetStatsQuery,
} from '@/store/services/screen-time.service'
import { useListRulesQuery } from '@/store/services/wellness-rule.service'
import type { WellnessRuleItem } from '@/types/models/screen-time.model'
import { WELLNESS_RULE_TYPES } from '@/constants/wellness'


const HEARTBEAT_INTERVAL_MS  = 60_000   // 1 minute
const VIDEO_FLUSH_INTERVAL_MS = 30_000  // 30 seconds
const RULE_EVAL_INTERVAL_MS   = 60_000  // 1 minute


export function useScreenTimeTracker(isAuthenticated: boolean) {
    const dispatch = useAppDispatch()

    const sessionUuid       = useAppSelector((s) => s.wellness.sessionUuid)
    const sessionStartedAt  = useAppSelector((s) => s.wellness.sessionStartedAt)
    const todayTotalSeconds = useAppSelector((s) => s.wellness.todayTotalSeconds)
    const todayVideoSeconds = useAppSelector((s) => s.wellness.todayVideoSeconds)
    const videoWatchSeconds = useAppSelector((s) => s.wellness.videoWatchSeconds)
    const isAlertVisible    = useAppSelector((s) => s.wellness.isAlertVisible)

    const [startSession]    = useStartSessionMutation()
    const [sendHeartbeat]   = useSendHeartbeatMutation()
    const [updateVideoTime] = useUpdateVideoTimeMutation()
    const [endSession]      = useEndSessionMutation()

    const { data: statsData } = useGetStatsQuery({ period: 'today' }, { skip: !isAuthenticated })
    const { data: rulesData } = useListRulesQuery(undefined, { skip: !isAuthenticated })

    const sessionUuidRef       = useRef<string | null>(null)
    const sessionStartedAtRef  = useRef<number | null>(null)
    const videoAccumulatorRef  = useRef(0)
    const lastAlertRuleRef     = useRef<string | null>(null)

    // Sync Redux state into refs so cleanup closures see current values
    useEffect(() => { sessionUuidRef.current = sessionUuid },      [sessionUuid])
    useEffect(() => { sessionStartedAtRef.current = sessionStartedAt }, [sessionStartedAt])

    // Hydrate today's stats from API on mount
    useEffect(() => {
        if (statsData?.data) {
            dispatch(setTodayStats({
                totalSeconds: statsData.data.total_seconds,
                videoSeconds: statsData.data.video_seconds,
            }))
        }
    }, [statsData, dispatch])


    const handleEndSession = useCallback(async (uuid: string, startedAt: number) => {
        const duration = Math.round((Date.now() - startedAt) / 1000)
        try {
            await endSession({ uuid, duration_seconds: duration })
        } catch { /* fire-and-forget */ }
        dispatch(clearSession())
    }, [endSession, dispatch])

    useEffect(() => {
        if (!isAuthenticated) return

        let mounted = true

        const init = async () => {
            try {
                const res = await startSession().unwrap()
                if (!mounted) return
                dispatch(setSession({ uuid: res.data.uuid, startedAt: Date.now() }))
            } catch { /* session start failed, no-op */ }
        }

        init()

        const beforeUnload = () => {
            const uuid      = sessionUuidRef.current
            const startedAt = Date.now() // approximate, redux may be gone
            if (uuid) {
                // Synchronous beacon for beforeunload
                const duration = Math.round((Date.now() - (Date.now())) / 1000)
                navigator.sendBeacon?.(`/api/proxy/wellness/session-end/${uuid}`, JSON.stringify({ duration_seconds: duration }))
            }
        }

        window.addEventListener('beforeunload', beforeUnload)

        return () => {
            mounted = false
            window.removeEventListener('beforeunload', beforeUnload)
            const uuid      = sessionUuidRef.current
            const startedAt = sessionStartedAtRef.current
            if (uuid && startedAt) {
                handleEndSession(uuid, startedAt)
            }
        }
    }, [isAuthenticated, startSession, dispatch, handleEndSession])


    useEffect(() => {
        if (!sessionUuid) return

        const interval = setInterval(() => {
            sendHeartbeat(sessionUuid).catch(() => {})
        }, HEARTBEAT_INTERVAL_MS)

        return () => clearInterval(interval)
    }, [sessionUuid, sendHeartbeat])


    useEffect(() => {
        if (!sessionUuid) return

        const interval = setInterval(() => {
            if (videoAccumulatorRef.current > 0 && sessionUuid) {
                updateVideoTime({ uuid: sessionUuid, video_seconds: videoAccumulatorRef.current }).catch(() => {})
                dispatch(addVideoSeconds(videoAccumulatorRef.current))
                videoAccumulatorRef.current = 0
            }
        }, VIDEO_FLUSH_INTERVAL_MS)

        return () => clearInterval(interval)
    }, [sessionUuid, updateVideoTime, dispatch])


    const evaluateRules = useCallback((rules: WellnessRuleItem[]) => {
        if (isAlertVisible) return

        const elapsedMinutes    = sessionStartedAt ? (Date.now() - sessionStartedAt) / 60_000 : 0
        const totalMinutesToday = (todayTotalSeconds + elapsedMinutes * 60) / 60
        const videoMinutesToday = (todayVideoSeconds + videoWatchSeconds) / 60
        const currentHour       = new Date().getHours()

        for (const rule of rules) {
            if (!rule.is_enabled) continue
            if (lastAlertRuleRef.current === rule.uuid) continue

            let triggered = false

            if (rule.type === WELLNESS_RULE_TYPES.CONTINUOUS_USAGE) {
                const threshold = Number(rule.conditions['minutes'] ?? 120)
                triggered = elapsedMinutes >= threshold
            } else if (rule.type === WELLNESS_RULE_TYPES.DAILY_LIMIT) {
                const threshold = Number(rule.conditions['minutes'] ?? 180)
                triggered = totalMinutesToday >= threshold
            } else if (rule.type === WELLNESS_RULE_TYPES.VIDEO_WATCH_TIME) {
                const threshold = Number(rule.conditions['minutes'] ?? 90)
                triggered = videoMinutesToday >= threshold
            } else if (rule.type === WELLNESS_RULE_TYPES.LATE_NIGHT) {
                const fromHour = Number(rule.conditions['from_hour'] ?? 22)
                const toHour   = Number(rule.conditions['to_hour']   ?? 6)
                triggered = fromHour > toHour
                    ? currentHour >= fromHour || currentHour < toHour  // spans midnight
                    : currentHour >= fromHour && currentHour < toHour
            }

            if (triggered) {
                lastAlertRuleRef.current = rule.uuid
                dispatch(showAlert({
                    title:    rule.title,
                    message:  rule.message,
                    ruleUuid: rule.uuid,
                    action:   rule.action,
                }))
                break // show one alert at a time
            }
        }
    }, [isAlertVisible, sessionStartedAt, todayTotalSeconds, todayVideoSeconds, videoWatchSeconds, dispatch])

    useEffect(() => {
        const rules = rulesData?.data
        if (!rules || !sessionUuid) return

        const interval = setInterval(() => evaluateRules(rules), RULE_EVAL_INTERVAL_MS)
        // Also evaluate immediately on rules load
        evaluateRules(rules)

        return () => clearInterval(interval)
    }, [rulesData, sessionUuid, evaluateRules])

    return {
        addVideoSeconds: (seconds: number) => { videoAccumulatorRef.current += seconds },
    }
}
