import { PosterType } from '@/constants/enum'
import { ResType } from '@/types/response/response.type'
import { CommentType } from '@/types/schemas/Comment.schema'
import { TikTokPostType } from '@/types/schemas/TikTokPost.schema'

export type MetaDataListPost = {
    type: 'offset' | 'simple' | 'cursor'
    current_page: number
    last_page: number
    per_page: number
    total?: number
    next_page_url?: string | null
    prev_page_url?: string | null
}

export type MetaDataListComment = MetaDataListPost & {
    type: PosterType.COMMENT
}

export type GetPostDetailRes = ResType<TikTokPostType, MetaDataListPost>

export type GetListPostRes = ResType<TikTokPostType[], MetaDataListPost>

export type GetListCommentRes = ResType<
    {
        posts: CommentType[]
    },
    MetaDataListComment
>

export type SearchPostRes = ResType<TikTokPostType[], MetaDataListPost>
