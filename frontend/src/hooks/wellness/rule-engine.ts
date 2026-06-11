import { WELLNESS_RULE_TYPES } from '@/constants/wellness'
import type { WellnessRuleItem } from '@/types/models/screen-time.model'

export interface RuleContext {
    totalMinutesToday: number
    videoMinutesToday: number
    sessionStartedAt: number | null
    currentHour: number
    dismissedRules: string[]
    snoozedRules: Record<string, number>
    cycleTracker: Map<string, number>
}

export interface RuleStrategy {
    canTrigger(rule: WellnessRuleItem, context: RuleContext): boolean
}

class ContinuousUsageRule implements RuleStrategy {
    canTrigger(rule: WellnessRuleItem, context: RuleContext): boolean {
        const threshold = Number(rule.conditions['minutes'] ?? 120)
        const now = Date.now()
        const sessionStart = context.sessionStartedAt ?? now
        const minutesSinceStart = (now - sessionStart) / 60_000
        const currentCycle = Math.floor(minutesSinceStart / threshold)
        const lastCycle = context.cycleTracker.get(rule.uuid) ?? -1
        if (currentCycle > lastCycle && minutesSinceStart >= threshold) {
            context.cycleTracker.set(rule.uuid, currentCycle)
            return true
        }
        return false
    }
}

class DailyLimitRule implements RuleStrategy {
    canTrigger(rule: WellnessRuleItem, context: RuleContext): boolean {
        const threshold = Number(rule.conditions['minutes'] ?? 180)
        const currentCycle = context.totalMinutesToday >= threshold ? 1 : 0
        const lastCycle = context.cycleTracker.get(rule.uuid) ?? -1
        if (currentCycle > lastCycle) {
            context.cycleTracker.set(rule.uuid, currentCycle)
            return true
        }
        return false
    }
}

class VideoWatchRule implements RuleStrategy {
    canTrigger(rule: WellnessRuleItem, context: RuleContext): boolean {
        const threshold = Number(rule.conditions['minutes'] ?? 90)
        const currentCycle = context.videoMinutesToday >= threshold ? 1 : 0
        const lastCycle = context.cycleTracker.get(rule.uuid) ?? -1
        if (currentCycle > lastCycle) {
            context.cycleTracker.set(rule.uuid, currentCycle)
            return true
        }
        return false
    }
}

class LateNightRule implements RuleStrategy {
    canTrigger(rule: WellnessRuleItem, context: RuleContext): boolean {
        const fromHour = Number(rule.conditions['from_hour'] ?? 22)
        const toHour = Number(rule.conditions['to_hour'] ?? 6)
        const h = context.currentHour
        const inLateNight = fromHour > toHour ? h >= fromHour || h < toHour : h >= fromHour && h < toHour
        const currentCycle = inLateNight ? 1 : 0
        const lastCycle = context.cycleTracker.get(rule.uuid) ?? 0
        if (currentCycle === 1 && lastCycle !== 1) {
            context.cycleTracker.set(rule.uuid, currentCycle)
            return true
        }
        return false
    }
}

export class RuleEvaluator {
    private strategies: Partial<Record<string, RuleStrategy>> = {
        [WELLNESS_RULE_TYPES.CONTINUOUS_USAGE]: new ContinuousUsageRule(),
        [WELLNESS_RULE_TYPES.DAILY_LIMIT]: new DailyLimitRule(),
        [WELLNESS_RULE_TYPES.VIDEO_WATCH_TIME]: new VideoWatchRule(),
        [WELLNESS_RULE_TYPES.LATE_NIGHT]: new LateNightRule()
    }

    evaluate(rules: WellnessRuleItem[], context: RuleContext): WellnessRuleItem | null {
        const now = Date.now()
        for (const rule of rules) {
            if (!rule.is_enabled) continue
            if (context.dismissedRules.includes(rule.uuid)) continue
            const snoozedUntil = context.snoozedRules[rule.uuid]
            if (snoozedUntil && now < snoozedUntil) continue

            const strategy = this.strategies[rule.type]
            if (strategy?.canTrigger(rule, context)) {
                return rule
            }
        }
        return null
    }
}
