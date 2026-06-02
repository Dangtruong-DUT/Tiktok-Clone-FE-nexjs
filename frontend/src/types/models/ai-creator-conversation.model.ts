import { CONVERSATION_STATUSES, CONVERSATION_STEPS } from '@/constants/ai-studio'

export type AiConversationStatus = (typeof CONVERSATION_STATUSES)[keyof typeof CONVERSATION_STATUSES]
export type AiConversationStep   = (typeof CONVERSATION_STEPS)[keyof typeof CONVERSATION_STEPS]

export interface AiConversationGeneratedResult {
    short_caption:        string
    professional_caption: string
    viral_caption:        string
    hashtags:             string[]
    topic:                string
    content_intent:       string
    target_audience:      string
    hook:                 string | null
    confidence_score:     number
}

export interface AiCreatorConversationType {
    uuid:                 string
    status:               AiConversationStatus
    status_label:         string
    current_step:         AiConversationStep | null
    answers:              Record<string, string>
    last_ai_message:      string | null
    options:              string[] | null
    initial_prompt:       string | null
    generated_result:     AiConversationGeneratedResult | null
    is_ready_to_generate: boolean
    token_usage:          { prompt_tokens: number; completion_tokens: number; total_tokens: number } | null
    error_message:        string | null
    completed_at:         string | null
    created_at:           string
}
