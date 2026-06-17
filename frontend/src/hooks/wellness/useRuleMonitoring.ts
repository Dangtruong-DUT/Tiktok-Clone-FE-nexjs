'use client'

import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { showAlert } from '@/store/features/wellnessSlice'
import { useListRulesQuery } from '@/store/services/wellness/wellness-rule.service'
import { RuleEvaluator, type RuleContext } from './rule-engine'

const RULE_EVAL_INTERVAL_MS = 60_000

export function useRuleMonitoring(params: { sessionUuid: string | null; sessionStartedAt: number | null }): void {
    const { sessionUuid, sessionStartedAt } = params
    const dispatch = useAppDispatch()

    const isAuthenticated = useAppSelector((s) => !!s.auth.isAuthenticated)
    const isAlertVisible = useAppSelector((s) => s.wellness.isAlertVisible)
    const todayTotalSeconds = useAppSelector((s) => s.wellness.todayTotalSeconds)
    const todayVideoSeconds = useAppSelector((s) => s.wellness.todayVideoSeconds)
    const videoWatchSeconds = useAppSelector((s) => s.wellness.videoWatchSeconds)
    const dismissedRules = useAppSelector((s) => s.wellness.dismissedRules)
    const snoozedRules = useAppSelector((s) => s.wellness.snoozedRules)

    const { data: rulesData } = useListRulesQuery(undefined, { skip: !isAuthenticated })

    // All mutable state is mirrored into refs so the interval callback always
    // reads current values without being listed as an effect dependency.
    // This prevents the interval from being torn down and recreated on every
    // state change (which would cause immediate re-evaluation and timer drift).
    const isAlertVisibleRef = useRef(isAlertVisible)
    const todayTotalSecondsRef = useRef(todayTotalSeconds)
    const todayVideoSecondsRef = useRef(todayVideoSeconds)
    const videoWatchSecondsRef = useRef(videoWatchSeconds)
    const dismissedRulesRef = useRef(dismissedRules)
    const snoozedRulesRef = useRef(snoozedRules)
    const rulesDataRef = useRef(rulesData)
    const sessionUuidRef = useRef(sessionUuid)
    const sessionStartedAtRef = useRef(sessionStartedAt)

    useEffect(() => {
        isAlertVisibleRef.current = isAlertVisible
    }, [isAlertVisible])
    useEffect(() => {
        todayTotalSecondsRef.current = todayTotalSeconds
    }, [todayTotalSeconds])
    useEffect(() => {
        todayVideoSecondsRef.current = todayVideoSeconds
    }, [todayVideoSeconds])
    useEffect(() => {
        videoWatchSecondsRef.current = videoWatchSeconds
    }, [videoWatchSeconds])
    useEffect(() => {
        dismissedRulesRef.current = dismissedRules
    }, [dismissedRules])
    useEffect(() => {
        snoozedRulesRef.current = snoozedRules
    }, [snoozedRules])
    useEffect(() => {
        rulesDataRef.current = rulesData
    }, [rulesData])
    useEffect(() => {
        sessionUuidRef.current = sessionUuid
    }, [sessionUuid])
    useEffect(() => {
        sessionStartedAtRef.current = sessionStartedAt
    }, [sessionStartedAt])

    const lastAlertCycleRef = useRef<Map<string, number>>(new Map())
    const evaluator = useMemo(() => new RuleEvaluator(), [])

    const evaluateRules = useCallback(() => {
        if (isAlertVisibleRef.current) return
        const rules = rulesDataRef.current?.data
        const uuid = sessionUuidRef.current
        if (!rules || !uuid) return

        const context: RuleContext = {
            totalMinutesToday: todayTotalSecondsRef.current / 60,
            videoMinutesToday: (todayVideoSecondsRef.current + videoWatchSecondsRef.current) / 60,
            sessionStartedAt: sessionStartedAtRef.current,
            currentHour: new Date().getHours(),
            dismissedRules: dismissedRulesRef.current,
            snoozedRules: snoozedRulesRef.current,
            cycleTracker: lastAlertCycleRef.current
        }

        const triggered = evaluator.evaluate(rules, context)
        if (triggered) {
            dispatch(
                showAlert({
                    title: triggered.title,
                    message: triggered.message,
                    ruleUuid: triggered.uuid,
                    action: triggered.action
                })
            )
        }
    }, [evaluator, dispatch])

    useEffect(() => {
        if (!sessionUuid) return

        const interval = setInterval(evaluateRules, RULE_EVAL_INTERVAL_MS)
        evaluateRules()

        return () => clearInterval(interval)
    }, [sessionUuid, evaluateRules])
}
