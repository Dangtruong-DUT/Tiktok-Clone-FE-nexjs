export const AI_TIME_PERIODS = {
    TODAY: 'today',
    WEEK: 'week',
    MONTH: 'month'
} as const

export type AiTimePeriod = (typeof AI_TIME_PERIODS)[keyof typeof AI_TIME_PERIODS]

export const AI_STUDIO_TABS = {
    METRICS: 'metrics',
    SETTINGS: 'settings',
    REQUESTS: 'requests'
} as const

export type AiStudioTabKey = (typeof AI_STUDIO_TABS)[keyof typeof AI_STUDIO_TABS]

export const AI_USAGE_LOG_STATUSES = {
    SUCCESS: 'success',
    FAILED: 'failed',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected'
} as const

export type AiUsageLogStatus = (typeof AI_USAGE_LOG_STATUSES)[keyof typeof AI_USAGE_LOG_STATUSES]

export const AI_STUDIO_REQUEST_TABLE_COLUMNS = ['User', 'Intent', 'Tokens', 'Cost', 'Latency', 'Status', 'Time'] as const

export const AI_COPILOT_FEATURE_FLAGS = {
    STREAMING: {
        key: 'streaming',
        label: 'Streaming Responses',
        description: 'Enable SSE token streaming for real-time AI responses'
    },
    FRAME_ANALYSIS: {
        key: 'frame_analysis',
        label: 'Frame Analysis',
        description: 'Allow users to capture and send video frames to the AI'
    },
    TIMELINE_CONTEXT: {
        key: 'timeline_context',
        label: 'Timeline Context',
        description: 'Allow users to select a video segment as context'
    },
    VIRAL_ANALYSIS: {
        key: 'viral_analysis',
        label: 'Viral Analysis',
        description: 'Enable viral potential analysis intent'
    }
} as const

export type AiCopilotFeatureFlagKey =
    (typeof AI_COPILOT_FEATURE_FLAGS)[keyof typeof AI_COPILOT_FEATURE_FLAGS]['key']

export const AI_COPILOT_FEATURE_FLAG_LIST = Object.values(AI_COPILOT_FEATURE_FLAGS)
