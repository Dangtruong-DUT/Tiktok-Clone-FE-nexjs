import { HttpResponseWithMeta } from '@/types/common/http-response.type'
import { PaginationMeta } from '@/types/common/pagination-meta.type'
import { HashtagType } from '@/types/models/hashtag.model'

export type GetListHashtagResType = HttpResponseWithMeta<HashtagType[], PaginationMeta>
