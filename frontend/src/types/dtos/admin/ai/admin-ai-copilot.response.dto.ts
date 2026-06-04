import type { ApiSuccessResponseWithData } from '@/types/common/http-response.type'

export interface AiCopilotMetricsByIntentItemDto {
    readonly total_requests: number
    readonly total_tokens: number
    readonly total_cost: number
    readonly intent: string | null
    readonly unique_users: number
}

export interface AiCopilotDailySeriesItemDto {
    readonly date: string
    readonly requests: number
    readonly tokens: number
    readonly cost: number
}

export interface AiCopilotTopUserItemDto {
    readonly user_id: number
    readonly requests: number
    readonly tokens: number
    readonly cost: number
}

export interface AiCopilotMetricsDto {
    readonly period: string
    readonly by_intent: AiCopilotMetricsByIntentItemDto[]
    readonly daily_series: AiCopilotDailySeriesItemDto[]
    readonly top_users: AiCopilotTopUserItemDto[]
}

export interface AiPromptTemplateDto {
    readonly id: number
    readonly intent: string
    readonly display_name: string
    readonly system_prompt: string
    readonly user_template: string
    readonly few_shot_examples?: unknown[] | null
    readonly is_active: boolean
    readonly version: number
}

export interface AiCopilotFeatureFlagsDto {
    readonly feature_flags: Record<string, boolean>
}

export interface AiCopilotSessionUserDto {
    readonly id?: number
    readonly uuid: string
    readonly username: string
}

export interface AiCopilotSessionListItemDto {
    readonly id: number
    readonly uuid: string
    readonly user_id: number
    readonly context_snapshot: Record<string, string | null> | null
    readonly is_large_video: boolean
    readonly expires_at: string | null
    readonly created_at: string
    readonly user?: AiCopilotSessionUserDto
}

export interface AiCopilotSessionsPaginationDto {
    readonly current_page: number
    readonly data: AiCopilotSessionListItemDto[]
    readonly last_page: number
    readonly per_page: number
    readonly total: number
}

export type GetCopilotMetricsResDto = ApiSuccessResponseWithData<AiCopilotMetricsDto>
export type GetCopilotSessionsResDto = ApiSuccessResponseWithData<AiCopilotSessionsPaginationDto>
export type ListPromptTemplatesResDto = ApiSuccessResponseWithData<AiPromptTemplateDto[]>
export type UpdatePromptTemplateResDto = ApiSuccessResponseWithData<AiPromptTemplateDto>
export type UpdateFeatureFlagsResDto = ApiSuccessResponseWithData<AiCopilotFeatureFlagsDto>
