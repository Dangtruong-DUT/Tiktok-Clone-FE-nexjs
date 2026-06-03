export type AiCopilotRole = 'user' | 'assistant' | 'system'
export type AiCopilotMessageStatus = 'success' | 'failed' | 'accepted' | 'rejected'

export type AiCopilotIntent =
    | 'write_caption'
    | 'write_title'
    | 'write_description'
    | 'generate_hashtags'
    | 'rewrite_content'
    | 'analyze_video'
    | 'analyze_viral'
    | 'analyze_retention'
    | 'analyze_hook'
    | 'analyze_cta'
    | 'analyze_audience'
    | 'analyze_frame'
    | 'suggest_cta'
    | 'schedule_post'
    | 'general_advice'
    | 'clarification'

export type AiCopilotTargetField = 'content' | 'title' | 'description' | 'hashtags'

export interface AiCopilotContentVariant {
    label: string
    value: string
}

export interface AiCopilotStructuredOutput {
    type: 'content_card'
    target_field: AiCopilotTargetField
    variants: AiCopilotContentVariant[]
    hashtags: string[]
    confidence: number
}

export interface AiCopilotScheduleOutput {
    type: 'schedule_card'
    post_uuid: string
    scheduled_at: string   // ISO-8601 UTC
    timezone: string
    human_readable: string
    confidence: number
}

export type AiCopilotAnyOutput = AiCopilotStructuredOutput | AiCopilotScheduleOutput

export interface AiCopilotMessage {
    uuid: string
    role: AiCopilotRole
    content: string
    intent?: AiCopilotIntent
    structured_output?: AiCopilotAnyOutput | null
    follow_up_chips?: string[]
    status: AiCopilotMessageStatus
    latency_ms?: number
    created_at: string
    // Client-side only fields
    isStreaming?: boolean
    streamingContent?: string
}

export interface AiCopilotSessionContext {
    video_title?: string
    video_description?: string
    video_category?: string
    video_transcript?: string
    ocr_text?: string
    creator_language?: string
    upload_session_uuid?: string
    post_uuid?: string
}

export interface AiCopilotSession {
    uuid: string
    context_snapshot?: AiCopilotSessionContext
    is_large_video: boolean
    expires_at?: string
    created_at: string
    messages: AiCopilotMessage[]
}

export interface AiCopilotTimelineSelection {
    start: number // seconds
    end: number   // seconds
}
