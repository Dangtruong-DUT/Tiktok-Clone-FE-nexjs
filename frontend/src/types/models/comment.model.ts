import { PosterType } from '@/constants/enum'
import type { TikTokPostType } from './post.model'

export interface CommentType extends TikTokPostType {
    readonly type: typeof PosterType.COMMENT
}
