import { z } from 'zod'

export const GetAdminCommentsParamsSchema = z
    .object({
        page: z.number().int().positive().optional(),
        per_page: z.number().int().positive().optional(),
        q: z.string().optional(),
        post_uuid: z.string().optional(),
        user_uuid: z.string().optional(),
        date_from: z.string().optional(),
        date_to: z.string().optional(),
        order_by: z.array(z.enum(['id', 'created_at', 'likes_count', '-id', '-created_at', '-likes_count'])).optional()
    })
    .strict()

export const DeleteCommentReqSchema = z
    .object({
        comment_uuid: z.string(),
        reason: z.string()
    })
    .strict()

export type GetAdminCommentsParams = z.infer<typeof GetAdminCommentsParamsSchema>
export type DeleteCommentReq = z.infer<typeof DeleteCommentReqSchema>

export const DeleteCommentFormSchema = z.object({
    reason: z.string().min(10)
})

export type DeleteCommentFormValues = z.infer<typeof DeleteCommentFormSchema>
