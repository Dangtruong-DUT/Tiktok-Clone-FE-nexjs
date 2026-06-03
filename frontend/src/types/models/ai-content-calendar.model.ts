import type { AiSuggestionStatus } from './ai-content-suggestion.model'
import { CALENDAR_ITEM_STATUSES } from '@/constants/ai-studio'

export type CalendarItemStatus = (typeof CALENDAR_ITEM_STATUSES)[keyof typeof CALENDAR_ITEM_STATUSES]

export interface ScheduledPostBriefType {
    uuid:          string
    status:        string
    status_label:  string
    scheduled_at:  string
    published_at:  string | null
}

export interface AiContentCalendarItemType {
    uuid:                     string
    day_of_week:              number
    content_idea:             string
    suggested_format:         string | null
    suggested_hashtags:       string[]
    caption_draft:            string | null
    hook_idea:                string | null
    estimated_virality_score: number | null
    status:                   CalendarItemStatus
    status_label:             string
    draft_post_id:            number | null
    scheduled_post:           ScheduledPostBriefType | null
    created_at:               string
}

export interface AiContentCalendarType {
    uuid:               string
    status:             AiSuggestionStatus
    niche:              string | null
    content_style:      string | null
    posting_frequency:  string | null
    primary_goals:      string[]
    target_audience:    string | null
    creator_language:   string
    weekly_themes:      string[]
    strategy_notes:     string | null
    items_count:        number
    items:              AiContentCalendarItemType[]
    generated_at:       string | null
    created_at:         string
}
