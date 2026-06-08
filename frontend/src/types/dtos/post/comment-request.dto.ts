import z from 'zod'

export const CommentBody = z
    .object({
        content: z.string().min(1, {
            message: 'Content must be at least 1 character.'
        }),
        post_uuid: z.string().min(1, {
            message: 'Post UUID is required.'
        })
    })
    .strict()

export type CommentBodyType = z.infer<typeof CommentBody>
