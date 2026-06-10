'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSession, clearSession, showAlert, setTodayStats, addVideoSeconds } from '@/store/features/wellnessSlice'
import {
    useStartSessionMutation,
    useSendHeartbeatMutation,
    useUpdateVideoTimeMutation,
    useEndSessionMutation,
    useGetStatsQuery
} from '@/store/services/screen-time.service'
import { useListRulesQuery } from '@/store/services/wellness-rule.service'
import type { WellnessRuleItem } from '@/types/models/screen-time.model'
import { WELLNESS_RULE_TYPES } from '@/constants/wellness'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import envConfig from '@/config/app.config'

const HEARTBEAT_INTERVAL_MS = 60_000 // 1 minute
const VIDEO_FLUSH_INTERVAL_MS = 30_000 // 30 seconds
const RULE_EVAL_INTERVAL_MS = 60_000 // 1 minute

export function useScreenTimeTracker(isAuthenticated: boolean) {
    const dispatch = useAppDispatch()

    const sessionUuid = useAppSelector((s) => s.wellness.sessionUuid)
    const sessionStartedAt = useAppSelector((s) => s.wellness.sessionStartedAt)
    const todayTotalSeconds = useAppSelector((s) => s.wellness.todayTotalSeconds)
    const todayVideoSeconds = useAppSelector((s) => s.wellness.todayVideoSeconds)
    const videoWatchSeconds = useAppSelector((s) => s.wellness.videoWatchSeconds)
    const isAlertVisible = useAppSelector((s) => s.wellness.isAlertVisible)
    const dismissedRules = useAppSelector((s) => s.wellness.dismissedRules)
    const snoozedRules = useAppSelector((s) => s.wellness.snoozedRules)

    const [startSession] = useStartSessionMutation()
    const [sendHeartbeat] = useSendHeartbeatMutation()
    const [updateVideoTime] = useUpdateVideoTimeMutation()
    const [endSession] = useEndSessionMutation()

    const { data: statsData } = useGetStatsQuery({ period: 'today' }, { skip: !isAuthenticated })
    const { data: rulesData } = useListRulesQuery(undefined, { skip: !isAuthenticated })

    const sessionUuidRef = useRef<string | null>(null)
    const sessionStartedAtRef = useRef<number | null>(null)
    const videoAccumulatorRef = useRef(0)
    const lastAlertCycleRef = useRef<Map<string, number>>(new Map())
    // Prevents concurrent startSession calls (e.g. React StrictMode double-invoke)
    const sessionStartingRef = useRef(false)

    // Keep mutation refs stable so they never appear in session-lifecycle effect deps.
    // RTK Query mutation triggers can change reference on auth state changes, which would
    // spuriously re-run the effect and fire a session-end right after login.
    const startSessionRef = useRef(startSession)
    const endSessionRef = useRef(endSession)
    const sendHeartbeatRef = useRef(sendHeartbeat)
    const updateVideoTimeRef = useRef(updateVideoTime)
    useEffect(() => {
        startSessionRef.current = startSession
    }, [startSession])
    useEffect(() => {
        endSessionRef.current = endSession
    }, [endSession])
    useEffect(() => {
        sendHeartbeatRef.current = sendHeartbeat
    }, [sendHeartbeat])
    useEffect(() => {
        updateVideoTimeRef.current = updateVideoTime
    }, [updateVideoTime])

    // Sync Redux state into refs so cleanup closures see current values
    useEffect(() => {
        sessionUuidRef.current = sessionUuid
    }, [sessionUuid])
    useEffect(() => {
        sessionStartedAtRef.current = sessionStartedAt
    }, [sessionStartedAt])

    // Hydrate today's stats from API on mount
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

    const handleEndSession = useCallback(
        async (uuid: string, startedAt: number) => {
            const duration = Math.round((Date.now() - startedAt) / 1000)
            try {
                await endSessionRef.current({ uuid, duration_seconds: duration })
            } catch {
                /* fire-and-forget */
            }
            dispatch(clearSession())
        },
        [dispatch]
    )

    useEffect(() => {
        if (!isAuthenticated) return

        let mounted = true

        const init = async () => {
            if (sessionStartingRef.current) return
            sessionStartingRef.current = true
            try {
                const res = await startSessionRef.current().unwrap()
                if (!mounted) return
                dispatch(setSession({ uuid: res.data.uuid, startedAt: Date.now() }))
            } catch {
                /* session start failed, no-op */
            } finally {
                sessionStartingRef.current = false
            }
        }

        init()

        const beforeUnload = () => {
            const uuid = sessionUuidRef.current
            const startedAt = sessionStartedAtRef.current
            if (!uuid) return
            const duration = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0
            const endUrl = `${envConfig.NEXT_PUBLIC_API_ENDPOINT}${BACKEND_API_ENDPOINT.WELLNESS.SESSION_END(uuid)}`
            fetch(endUrl, {
                method: 'POST',
                credentials: 'include',
                keepalive: true,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ duration_seconds: duration })
            }).catch(() => {})
        }

        window.addEventListener('beforeunload', beforeUnload)

        return () => {
            mounted = false
            window.removeEventListener('beforeunload', beforeUnload)
            const uuid = sessionUuidRef.current
            const startedAt = sessionStartedAtRef.current
            if (uuid && startedAt) {
                handleEndSession(uuid, startedAt)
            }
        }
    }, [isAuthenticated, dispatch, handleEndSession])

    useEffect(() => {
        if (!sessionUuid) return

        const interval = setInterval(() => {
            sendHeartbeatRef.current(sessionUuid).catch(() => {})
        }, HEARTBEAT_INTERVAL_MS)

        return () => clearInterval(interval)
    }, [sessionUuid])

    useEffect(() => {
        if (!sessionUuid) return

        const interval = setInterval(() => {
            const secs = videoAccumulatorRef.current
            if (secs > 0 && sessionUuid) {
                updateVideoTimeRef.current({ uuid: sessionUuid, video_seconds: secs }).catch(() => {})
                dispatch(addVideoSeconds(secs))
                videoAccumulatorRef.current = 0
            }
        }, VIDEO_FLUSH_INTERVAL_MS)

        return () => clearInterval(interval)
    }, [sessionUuid, dispatch])

    const evaluateRules = useCallback(
        (rules: WellnessRuleItem[]) => {
            if (isAlertVisible) return

            const now = Date.now()
            const totalMinutesToday = todayTotalSeconds / 60
            const videoMinutesToday = (todayVideoSeconds + videoWatchSeconds) / 60
            const currentHour = new Date(now).getHours()

            for (const rule of rules) {
                if (!rule.is_enabled) continue
                if (dismissedRules.includes(rule.uuid)) continue
                const snoozedUntil = snoozedRules[rule.uuid]
                if (snoozedUntil && now < snoozedUntil) continue

                let triggered = false
                const cycleKey = rule.uuid

                if (rule.type === WELLNESS_RULE_TYPES.CONTINUOUS_USAGE) {
                    const threshold = Number(rule.conditions['minutes'] ?? 120)
                    const sessionStart = sessionStartedAt ?? now
                    const minutesSinceSessionStart = (now - sessionStart) / 60_000
                    const currentCycle = Math.floor(minutesSinceSessionStart / threshold)
                    const lastCycle = lastAlertCycleRef.current.get(cycleKey) ?? -1
                    if (currentCycle > lastCycle && minutesSinceSessionStart >= threshold) {
                        triggered = true
                        lastAlertCycleRef.current.set(cycleKey, currentCycle)
                    }
                } else if (rule.type === WELLNESS_RULE_TYPES.DAILY_LIMIT) {
                    const threshold = Number(rule.conditions['minutes'] ?? 180)
                    const lastCycle = lastAlertCycleRef.current.get(cycleKey) ?? -1
                    const currentCycle = totalMinutesToday >= threshold ? 1 : 0
                    if (currentCycle > lastCycle) {
                        triggered = true
                        lastAlertCycleRef.current.set(cycleKey, currentCycle)
                    }
                } else if (rule.type === WELLNESS_RULE_TYPES.VIDEO_WATCH_TIME) {
                    const threshold = Number(rule.conditions['minutes'] ?? 90)
                    const lastCycle = lastAlertCycleRef.current.get(cycleKey) ?? -1
                    const currentCycle = videoMinutesToday >= threshold ? 1 : 0
                    if (currentCycle > lastCycle) {
                        triggered = true
                        lastAlertCycleRef.current.set(cycleKey, currentCycle)
                    }
                } else if (rule.type === WELLNESS_RULE_TYPES.LATE_NIGHT) {
                    const fromHour = Number(rule.conditions['from_hour'] ?? 22)
                    const toHour = Number(rule.conditions['to_hour'] ?? 6)
                    const inLateNight =
                        fromHour > toHour
                            ? currentHour >= fromHour || currentHour < toHour
                            : currentHour >= fromHour && currentHour < toHour
                    const lastCycle = lastAlertCycleRef.current.get(cycleKey) ?? 0
                    const currentCycle = inLateNight ? 1 : 0
                    if (currentCycle === 1 && lastCycle !== 1) {
                        triggered = true
                        lastAlertCycleRef.current.set(cycleKey, currentCycle)
                    }
                }

                if (triggered) {
                    dispatch(
                        showAlert({
                            title: rule.title,
                            message: rule.message,
                            ruleUuid: rule.uuid,
                            action: rule.action
                        })
                    )
                    break
                }
            }
        },
        [
            isAlertVisible,
            todayTotalSeconds,
            todayVideoSeconds,
            videoWatchSeconds,
            sessionStartedAt,
            dismissedRules,
            snoozedRules,
            dispatch
        ]
    )

    useEffect(() => {
        const rules = rulesData?.data
        if (!rules || !sessionUuid) return

        const interval = setInterval(() => evaluateRules(rules), RULE_EVAL_INTERVAL_MS)
        // Also evaluate immediately on rules load
        evaluateRules(rules)

        return () => clearInterval(interval)
    }, [rulesData, sessionUuid, evaluateRules])

    return {
        addVideoSeconds: (seconds: number) => {
            videoAccumulatorRef.current += seconds
        }
    }
}
