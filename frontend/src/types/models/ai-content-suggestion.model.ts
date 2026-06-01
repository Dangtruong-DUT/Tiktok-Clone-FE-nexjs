export type AiSuggestionStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type AiContentIntent =
    | 'educational'
    | 'entertainment'
    | 'review'
    | 'tutorial'
    | 'vlog'
    | 'promotional'
    | 'storytelling'
    | 'news'
    | 'lifestyle'
    | 'other'

export interface AiContentSuggestionType {
    uuid: string
    status: AiSuggestionStatus
    status_label: string
    short_caption: string | null
    professional_caption: string | null
    viral_caption: string | null
    hashtags: string[]
    topic: string | null
    category_suggestion: string | null
    target_audience: string | null
    content_intent: AiContentIntent | null
    confidence_score: number | null
    safety_notes: string | null
    provider: string
    model: string
    prompt_version: string
    error_message?: string | null
    applied_at: string | null
    generated_at: string | null
    created_at: string
}

export interface AiStudioSettingType {
    daily_limit_per_user: number
    global_daily_limit: number
    rate_limit_per_minute: number
    is_enabled: boolean
    require_min_input: boolean
    gemini_model: string
    max_output_tokens: number
    temperature: number
    timeout_seconds: number
    cache_ttl_hours: number
    async_mode: boolean
    updated_by: { uuid: string; name: string } | null
    updated_at: string | null
}

export interface AiStudioMetricsType {
    period: string
    total_requests: number
    completed: number
    failed: number
    pending: number
    success_rate: number
    apply_rate: number
    unique_users: number
    total_tokens: number
    avg_tokens: number
    prompt_tokens: number
    completion_tokens: number
    estimated_cost_usd: number
    intent_breakdown: Record<string, number>
    daily_series: Array<{ date: string; total: number; completed: number; failed: number }>
}
