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

export const AI_STUDIO_REQUEST_TABLE_COLUMNS = [
    'aiStudio.requests.columns.user',
    'aiStudio.requests.columns.intent',
    'aiStudio.requests.columns.tokens',
    'aiStudio.requests.columns.cost',
    'aiStudio.requests.columns.latency',
    'aiStudio.requests.columns.status',
    'aiStudio.requests.columns.time'
] as const

export type AiStudioRequestTableColumnKey = (typeof AI_STUDIO_REQUEST_TABLE_COLUMNS)[number]

export const AI_COPILOT_FEATURE_FLAGS = {
    STREAMING: {
        key: 'streaming',
        labelKey: 'aiStudio.featureFlags.streaming.label',
        descriptionKey: 'aiStudio.featureFlags.streaming.description'
    },
    FRAME_ANALYSIS: {
        key: 'frame_analysis',
        labelKey: 'aiStudio.featureFlags.frameAnalysis.label',
        descriptionKey: 'aiStudio.featureFlags.frameAnalysis.description'
    },
    TIMELINE_CONTEXT: {
        key: 'timeline_context',
        labelKey: 'aiStudio.featureFlags.timelineContext.label',
        descriptionKey: 'aiStudio.featureFlags.timelineContext.description'
    },
    VIRAL_ANALYSIS: {
        key: 'viral_analysis',
        labelKey: 'aiStudio.featureFlags.viralAnalysis.label',
        descriptionKey: 'aiStudio.featureFlags.viralAnalysis.description'
    }
} as const

export type AiCopilotFeatureFlagKey = (typeof AI_COPILOT_FEATURE_FLAGS)[keyof typeof AI_COPILOT_FEATURE_FLAGS]['key']

export const AI_COPILOT_FEATURE_FLAG_LIST = Object.values(AI_COPILOT_FEATURE_FLAGS)
