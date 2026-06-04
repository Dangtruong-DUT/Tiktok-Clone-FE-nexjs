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

export const AI_COPILOT_INTENTS = {
    WRITE_CAPTION: 'write_caption',
    WRITE_TITLE: 'write_title',
    WRITE_DESCRIPTION: 'write_description',
    GENERATE_HASHTAGS: 'generate_hashtags',
    REWRITE_CONTENT: 'rewrite_content',
    ANALYZE_VIDEO: 'analyze_video',
    ANALYZE_VIDEO_SEGMENT: 'analyze_video_segment',
    ANALYZE_VIRAL: 'analyze_viral',
    ANALYZE_RETENTION: 'analyze_retention',
    ANALYZE_HOOK: 'analyze_hook',
    ANALYZE_CTA: 'analyze_cta',
    ANALYZE_AUDIENCE: 'analyze_audience',
    ANALYZE_FRAME: 'analyze_frame',
    SUGGEST_CTA: 'suggest_cta',
    SCHEDULE_POST: 'schedule_post',
    GENERAL_ADVICE: 'general_advice',
    CLARIFICATION: 'clarification'
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
} as const

export type AiCopilotOutputType = (typeof AI_COPILOT_OUTPUT_TYPES)[keyof typeof AI_COPILOT_OUTPUT_TYPES]

export const AI_COPILOT_SSE_EVENT_TYPES = {
    CHUNK: 'chunk',
    DONE: 'done',
} as const

export const BOUNCE_DOT_INDEXES = [0, 1, 2] as const
