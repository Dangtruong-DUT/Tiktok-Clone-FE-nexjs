import type { ApiSuccessResponseWithData, ApiSuccessResponseWithMeta } from '@/types/common/http-response.type'
import type { AiUsageLogStatus } from '@/constants/admin/ai'

export interface AiMetricsDailySeriesItemDto {
    readonly date: string
    readonly total: number
    readonly tokens: number
    readonly cost: number
}

export interface AiMetricsResponseDto {
    readonly period: string
    readonly total_requests: number
    readonly completed: number
    readonly failed: number
    readonly success_rate: number
    readonly unique_users: number
    readonly total_tokens: number
    readonly total_cost_usd: number
    readonly estimated_cost_usd?: number
    readonly intent_breakdown: Record<string, number>
    readonly daily_series: AiMetricsDailySeriesItemDto[]
}

export interface AiStudioSettingUpdatedByDto {
    readonly uuid: string
    readonly name: string
}

export interface AiStudioSettingsDto {
    readonly daily_limit_per_user: number
    readonly global_daily_limit: number
    readonly rate_limit_per_minute: number
    readonly is_enabled: boolean
    readonly require_min_input: boolean
    readonly gemini_model: string
    readonly max_output_tokens: number
    readonly temperature: number
    readonly timeout_seconds: number
    readonly cache_ttl_hours: number
    readonly async_mode: boolean
    readonly updated_by: AiStudioSettingUpdatedByDto | null
    readonly updated_at: string | null
}

export interface AiUsageLogUserDto {
    readonly uuid: string
    readonly username: string
    readonly avatar_url: string | null
}

export interface AiUsageLogItemDto {
    readonly id: number
    readonly user_id: number
    readonly intent: string | null
    readonly total_tokens: number
    readonly cost_usd: number | null
    readonly latency_ms: number | null
    readonly status: AiUsageLogStatus
    readonly model: string | null
    readonly created_at: string
    readonly user?: AiUsageLogUserDto
}

export type GetAiMetricsResDto = ApiSuccessResponseWithData<AiMetricsResponseDto>
export type GetAiSettingsResDto = ApiSuccessResponseWithData<AiStudioSettingsDto>
export type ListAiRequestsResDto = ApiSuccessResponseWithMeta<AiUsageLogItemDto[]>
export type GetAiAvailableModelsResDto = ApiSuccessResponseWithData<string[]>
