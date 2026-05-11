import type { ApiSuccessResponse } from '@/types/common/http-response.type'
import type { PaginationMeta } from '@/types/common/pagination-meta.type'
import type { Appeal } from '@/types/models/appeal.model'

export type AppealListMeta = PaginationMeta
export type CreateAppealResponse = ApiSuccessResponse & { data: Appeal }
export type GetMyAppealsResponse = ApiSuccessResponse & { data: Appeal[]; meta: AppealListMeta }
export type GetAppealResponse = ApiSuccessResponse & { data: Appeal }
