import { z } from 'zod'

export const GenerateAiSuggestionReqBody = z
    .object({
        video_title: z.string().max(300).optional(),
        video_description: z.string().max(2000).optional(),
        video_transcript: z.string().max(5000).optional(),
        ocr_text: z.string().max(1000).optional(),
        creator_language: z.enum(['vi', 'en', 'ja', 'ko', 'zh', 'other']).optional(),
        video_category: z.string().max(100).optional(),
        regenerate: z.boolean().optional()
    })
    .refine(
        (d) =>
            Boolean(d.video_title) ||
            Boolean(d.video_description) ||
            Boolean(d.video_transcript) ||
            Boolean(d.ocr_text),
        { message: 'At least one of title, description, transcript, or OCR text is required.' }
    )

export type GenerateAiSuggestionReqBodyType = z.infer<typeof GenerateAiSuggestionReqBody>

export const UpdateAiStudioSettingsReqBody = z.object({
    daily_limit_per_user: z.number().int().min(1).max(1000).optional(),
    global_daily_limit: z.number().int().min(1).max(100000).optional(),
    rate_limit_per_minute: z.number().int().min(1).max(60).optional(),
    is_enabled: z.boolean().optional(),
    require_min_input: z.boolean().optional(),
    gemini_model: z.enum(['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash']).optional(),
    max_output_tokens: z.number().int().min(256).max(8192).optional(),
    temperature: z.number().min(0).max(1).optional(),
    timeout_seconds: z.number().int().min(10).max(120).optional(),
    cache_ttl_hours: z.number().int().min(1).max(168).optional(),
    async_mode: z.boolean().optional()
})

export type UpdateAiStudioSettingsReqBodyType = z.infer<typeof UpdateAiStudioSettingsReqBody>
