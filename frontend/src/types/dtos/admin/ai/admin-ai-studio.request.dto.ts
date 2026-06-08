import { z } from 'zod'
import type { AiTimePeriod, AiUsageLogStatus } from '@/constants/admin/ai'

export interface GetAiMetricsQueryDto {
    period?: AiTimePeriod
}

export interface ListAiRequestsQueryDto {
    intent?: string
    status?: AiUsageLogStatus
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
}

export const UpdateAiStudioSettingsReqBodySchema = z.object({
    daily_limit_per_user: z.number().min(1).max(1000).optional(),
    global_daily_limit: z.number().min(1).max(100000).optional(),
    rate_limit_per_minute: z.number().min(1).max(60).optional(),
    is_enabled: z.boolean().optional(),
    require_min_input: z.boolean().optional(),
    gemini_model: z.string().optional(),
    max_output_tokens: z.number().min(256).max(8192).optional(),
    temperature: z.number().min(0).max(1).optional(),
    timeout_seconds: z.number().min(10).max(120).optional(),
    cache_ttl_hours: z.number().min(1).max(168).optional(),
    async_mode: z.boolean().optional()
})

export type UpdateAiStudioSettingsReqBodyDto = z.infer<typeof UpdateAiStudioSettingsReqBodySchema>
