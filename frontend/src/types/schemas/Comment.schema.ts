import { PosterType } from '@/constants/enum'
import { TikTokPostType } from '@/types/schemas/TikTokPost.schema'

export interface CommentType extends TikTokPostType {
    type: PosterType.COMMENT
}
