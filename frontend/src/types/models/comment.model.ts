import { PosterType } from '@/constants/enum'
import type { TikTokPostType } from './post.model'

export type CommentType = TikTokPostType & {
    readonly type: typeof PosterType.COMMENT
}

/** @deprecated use CommentType */
export type CommentSchema = CommentType
