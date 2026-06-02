export interface GenerateCalendarBody {
    niche:              string
    content_style?:     string
    posting_frequency?: string
    primary_goals?:     string[]
    target_audience?:   string
    creator_language?:  string
}

export interface ScheduleCalendarItemBody {
    scheduled_at: string
    timezone?:    string
}
