import { WELLNESS_RULE_TYPES, WELLNESS_ACTIONS, WELLNESS_PERIODS } from '@/constants/wellness'

export type WellnessRuleType = (typeof WELLNESS_RULE_TYPES)[keyof typeof WELLNESS_RULE_TYPES]
export type WellnessAction = (typeof WELLNESS_ACTIONS)[keyof typeof WELLNESS_ACTIONS]
export type WellnessPeriod = (typeof WELLNESS_PERIODS)[keyof typeof WELLNESS_PERIODS]

export interface StartSessionResponse {
    uuid: string
    started_at: string
}

export interface ScreenTimeDailySeries {
    date: string
    seconds: number
    video_seconds: number
}

export interface ScreenTimeStatsType {
    period: WellnessPeriod
    total_seconds: number
    video_seconds: number
    sessions_count: number
    comments_count: number
    posts_count: number
    likes_count: number
    avg_daily_seconds: number
    peak_hour: number | null
    daily_series: ScreenTimeDailySeries[]
}

export interface WellnessRuleItem {
    uuid: string
    type: WellnessRuleType
    type_label: string
    conditions: Record<string, number | string>
    action: WellnessAction
    action_label: string
    title: string
    message: string
    is_enabled: boolean
    natural_language_input: string | null
    created_at: string
    updated_at: string
}

export interface ParsedRulePreview {
    type: WellnessRuleType
    conditions: Record<string, number | string>
    action: WellnessAction
    title: string
    message: string
    confidence: number
}

export interface WellnessSuggestedRule {
    type: WellnessRuleType
    conditions: Record<string, number | string>
    action: WellnessAction
    title: string
    message: string
    rationale: string
}

export interface WellnessAnalysisType {
    summary: string
    patterns: string[]
    concerns: string[]
    recommendations: string[]
    suggested_rules: WellnessSuggestedRule[]
}
