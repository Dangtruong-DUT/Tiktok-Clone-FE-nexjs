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

    const lastAlertCycleRef = useRef<Map<string, number>>(new Map())
    const evaluator = useMemo(() => new RuleEvaluator(), [])

    const evaluateRules = useCallback(() => {
        if (isAlertVisible) return
        const rules = rulesData?.data
        if (!rules || !sessionUuid) return

        const context: RuleContext = {
            totalMinutesToday: todayTotalSeconds / 60,
            videoMinutesToday: (todayVideoSeconds + videoWatchSeconds) / 60,
            sessionStartedAt,
            currentHour: new Date().getHours(),
            dismissedRules,
            snoozedRules,
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
    }, [
        isAlertVisible,
        rulesData,
        sessionUuid,
        todayTotalSeconds,
        todayVideoSeconds,
        videoWatchSeconds,
        sessionStartedAt,
        dismissedRules,
        snoozedRules,
        evaluator,
        dispatch
    ])

    useEffect(() => {
        const rules = rulesData?.data
        if (!rules || !sessionUuid) return

        const interval = setInterval(evaluateRules, RULE_EVAL_INTERVAL_MS)
        evaluateRules()

        return () => clearInterval(interval)
    }, [rulesData, sessionUuid, evaluateRules])
}
