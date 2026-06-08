import type { ApiSuccessResponseWithData, ApiSuccessResponseWithMeta } from '@/types/common/http-response.type'
import type { PaginationMeta } from '@/types/common/pagination-meta.type'
import type { Appeal, ResourcePreview } from '@/types/models/appeal.model'

export type CreateAppealResponse = ApiSuccessResponseWithData<Appeal>
export type GetAppealResponse = ApiSuccessResponseWithData<Appeal>
export type GetResourcePreviewResponse = ApiSuccessResponseWithData<ResourcePreview | null>
export type GetMyAppealsResponse = ApiSuccessResponseWithMeta<Appeal[], PaginationMeta>
