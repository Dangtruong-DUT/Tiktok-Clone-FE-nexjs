import { Audience, PosterType } from '@/constants/enum'
import { HashtagSchema } from '@/types/models/hashtag.model'
import { MediaSchema } from '@/types/models/media.model'
import { MentionSchema } from '@/types/models/mention.model'
import { UserSchema } from '@/types/models/user.model'
import { z } from 'zod'

export const TikTokPostSchema = z
    .object({
        id: z.number(),
        uuid: z.string(),
        user_id: z.number(),
        user_uuid: z.string().optional(),
        type: z.nativeEnum(PosterType),
        audience: z.nativeEnum(Audience),
        content: z.string(),
        parent_id: z.number().nullable(),
        hashtags: z.array(HashtagSchema),
        created_at: z.string(),
        updated_at: z.string(),
        medias: z.array(MediaSchema),
        mentions: z.array(MentionSchema),
        likes_count: z.number(),
        bookmarks_count: z.number(),
        repost_count: z.number(),
        comments_count: z.number(),
        quote_post_count: z.number(),
        is_liked: z.boolean(),
        is_bookmarked: z.boolean(),
        guest_views: z.number(),
        user_views: z.number(),
        author: UserSchema,
        thumbnail_url: z.string(),
        thumbnail_file_id: z.number().nullable().optional()
    })
    .strict()

export type TikTokPostType = z.infer<typeof TikTokPostSchema>
