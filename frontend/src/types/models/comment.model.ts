import { PosterType } from '@/constants/enum'
import { z } from 'zod'
import { TikTokPostSchema } from './post.model'

export const CommentSchema = TikTokPostSchema.extend({
    type: z.literal(PosterType.COMMENT)
})

export type CommentType = z.infer<typeof CommentSchema>
