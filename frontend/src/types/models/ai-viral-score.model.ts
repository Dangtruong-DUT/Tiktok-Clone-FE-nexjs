import type { AiSuggestionStatus } from './ai-content-suggestion.model'
import { VIRAL_SCORE_LEVELS } from '@/constants/ai-studio'

export type ViralScoreLevel = (typeof VIRAL_SCORE_LEVELS)[keyof typeof VIRAL_SCORE_LEVELS]

export interface ViralScoreBreakdown {
    hook_strength:      number
    hashtag_quality:    number
    audience_clarity:   number
    engagement_trigger: number
    format_fit:         number
}

export interface AiViralScoreType {
    uuid:               string
    status:             AiSuggestionStatus
    status_label:       string
    caption:            string | null
    hashtags:           string[]
    overall_score:      number | null
    level:              ViralScoreLevel | null
    level_label:        string | null
    breakdown:          ViralScoreBreakdown | null
    strengths:          string[]
    weaknesses:         string[]
    recommendations:    string[]
    improved_caption:   string | null
    suggested_hashtags: string[]
    error_message:      string | null
    analyzed_at:        string | null
    created_at:         string
}
