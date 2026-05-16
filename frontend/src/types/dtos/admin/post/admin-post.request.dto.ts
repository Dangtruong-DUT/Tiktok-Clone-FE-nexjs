import { z } from 'zod'

export const GetAdminPostsParamsSchema = z
    .object({
        page: z.number().int().positive().optional(),
        per_page: z.number().int().positive().optional(),
        q: z.string().optional(),
        user_uuid: z.string().optional(),
        status: z.enum(['all', 'visible', 'deleted']).optional(),
        date_from: z.string().optional(),
        date_to: z.string().optional(),
        order_by: z.array(z.enum(['id', 'created_at', 'likes_count', '-id', '-created_at', '-likes_count'])).optional()
    })
    .strict()

export const DeletePostReqSchema = z
    .object({
        post_uuid: z.string(),
        reason: z.string()
    })
    .strict()

export type GetAdminPostsParams = z.infer<typeof GetAdminPostsParamsSchema>
export type DeletePostReq = z.infer<typeof DeletePostReqSchema>

// Form schemas (client-side validation)
export const DeletePostFormSchema = z
    .object({
        reason: z.string().min(1),
        customReason: z.string().optional()
    })
    .refine((data) => data.reason !== 'other' || (data.customReason && data.customReason.trim().length > 0), {
        message: 'Custom reason is required',
        path: ['customReason']
    })

export type DeletePostFormValues = z.infer<typeof DeletePostFormSchema>
