import { HttpResponseWithMeta } from '@/types/common/http-response.type'
import { OffsetPaginationMeta, PaginationMeta } from '@/types/common/pagination-meta.type'
import { CommentType } from '@/types/models/comment.model'
import { TikTokPostType } from '@/types/models/post.model'

export type MetaDataListPost = PaginationMeta

export type MetaDataListComment = OffsetPaginationMeta

export type GetPostDetailRes = HttpResponseWithMeta<TikTokPostType, MetaDataListPost>

export type GetListPostRes = HttpResponseWithMeta<TikTokPostType[], MetaDataListPost>

export type GetListCommentRes = HttpResponseWithMeta<CommentType[], MetaDataListComment>

export type SearchPostRes = HttpResponseWithMeta<TikTokPostType[], MetaDataListPost>
