import type { AiTimePeriod, AiCopilotFeatureFlagKey } from '@/constants/admin/ai'

export interface GetCopilotMetricsQueryDto {
    period?: AiTimePeriod
}

export interface GetCopilotSessionsQueryDto {
    page?: number
    perPage?: number
}

export interface UpdatePromptTemplateReqBodyDto {
    display_name?: string
    system_prompt?: string
    user_template?: string
    is_active?: boolean
}

export interface UpdatePromptTemplateMutationDto {
    intent: string
    data: UpdatePromptTemplateReqBodyDto
}

export interface UpdateFeatureFlagsReqBodyDto {
    flags: Partial<Record<AiCopilotFeatureFlagKey, boolean>>
}
