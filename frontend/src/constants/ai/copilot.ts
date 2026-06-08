export const AI_COPILOT_ROLES = {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system'
} as const

export const AI_COPILOT_MESSAGE_STATUSES = {
    SUCCESS: 'success',
    FAILED: 'failed',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected'
} as const

export const AI_COPILOT_TASK_TYPES = {
    CONTENT_GENERATION: 'content_generation',
    APP_KNOWLEDGE: 'app_knowledge',
    NAVIGATION: 'navigation',
    ANALYTICS: 'analytics',
    VIDEO_REVIEW: 'video_review',
    UNKNOWN: 'unknown'
} as const

export const AI_COPILOT_TARGET_FIELDS = {
    CONTENT: 'content',
    TITLE: 'title',
    DESCRIPTION: 'description',
    HASHTAGS: 'hashtags'
} as const

export const AI_COPILOT_OUTPUT_TYPES = {
    CONTENT_CARD: 'content_card',
    SCHEDULE_CARD: 'schedule_card',
    NAV_CARD: 'nav_card',
    ANALYTICS_RESULT: 'analytics_result'
} as const

export type AiCopilotOutputType = (typeof AI_COPILOT_OUTPUT_TYPES)[keyof typeof AI_COPILOT_OUTPUT_TYPES]
export type AiCopilotTaskType = (typeof AI_COPILOT_TASK_TYPES)[keyof typeof AI_COPILOT_TASK_TYPES]

export const AI_COPILOT_SSE_EVENT_TYPES = {
    CHUNK: 'chunk',
    DONE: 'done'
} as const

export const BOUNCE_DOT_INDEXES = [0, 1, 2] as const
