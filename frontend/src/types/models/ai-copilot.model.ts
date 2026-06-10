import {
    type AiCopilotTaskType,
    AI_COPILOT_MESSAGE_STATUSES,
    AI_COPILOT_OUTPUT_TYPES,
    AI_COPILOT_ROLES,
    AI_COPILOT_TARGET_FIELDS
} from '@/constants/ai/copilot'

export type AiCopilotRole = (typeof AI_COPILOT_ROLES)[keyof typeof AI_COPILOT_ROLES]
export type AiCopilotMessageStatus = (typeof AI_COPILOT_MESSAGE_STATUSES)[keyof typeof AI_COPILOT_MESSAGE_STATUSES]
export type AiCopilotIntent = string
export type AiCopilotTargetField = (typeof AI_COPILOT_TARGET_FIELDS)[keyof typeof AI_COPILOT_TARGET_FIELDS]

export interface AiCopilotContentVariant {
    label: string
    value: string
}

export interface AiCopilotStructuredOutput {
    type: typeof AI_COPILOT_OUTPUT_TYPES.CONTENT_CARD
    target_field: AiCopilotTargetField
    variants: AiCopilotContentVariant[]
    hashtags: string[]
    confidence: number
}

export interface AiCopilotScheduleOutput {
    type: typeof AI_COPILOT_OUTPUT_TYPES.SCHEDULE_CARD
    post_uuid: string
    scheduled_at: string
    timezone: string
    human_readable: string
    confidence: number
}

export interface AiCopilotNavRoute {
    label: string
    path: string
    description: string
}

export interface AiCopilotNavOutput {
    type: typeof AI_COPILOT_OUTPUT_TYPES.NAV_CARD
    routes: AiCopilotNavRoute[]
}

export interface AiCopilotAnalyticsOutput {
    type: typeof AI_COPILOT_OUTPUT_TYPES.ANALYTICS_RESULT
    task_type?: AiCopilotTaskType
    response_view: string
    tool_results: Record<string, unknown>
}

export type AiCopilotAnyOutput =
    | AiCopilotStructuredOutput
    | AiCopilotScheduleOutput
    | AiCopilotNavOutput
    | AiCopilotAnalyticsOutput

export interface AiCopilotMessage {
    uuid: string
    role: AiCopilotRole
    content: string
    intent?: AiCopilotIntent | null
    task_type?: AiCopilotTaskType | null
    structured_output?: AiCopilotAnyOutput | null
    follow_up_chips?: string[]
    status: AiCopilotMessageStatus
    latency_ms?: number
    created_at: string
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
    start: number
    end: number
}
