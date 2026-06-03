export const CONVERSATION_STATUSES = {
    WAITING_FOR_ANSWER: 'waiting_for_answer',
    GENERATING:         'generating',
    COMPLETED:          'completed',
    FAILED:             'failed',
} as const

export const CONVERSATION_STEPS = {
    TOPIC:    'topic',
    FORMAT:   'format',
    AUDIENCE: 'audience',
    TONE:     'tone',
    HOOK:     'hook',
} as const

export const VIRAL_SCORE_LEVELS = {
    LOW:    'low',
    MEDIUM: 'medium',
    HIGH:   'high',
    VIRAL:  'viral',
} as const

export const CALENDAR_ITEM_STATUSES = {
    IDEA:      'idea',
    DRAFT:     'draft',
    SCHEDULED: 'scheduled',
    PUBLISHED: 'published',
} as const
