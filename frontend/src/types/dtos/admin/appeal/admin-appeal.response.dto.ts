import type { ApiSuccessResponse } from '@/types/common/http-response.type'
import type { PaginationMeta } from '@/types/common/pagination-meta.type'
import type { AdminAppeal } from '@/types/models/admin-appeal.model'

export type GetAdminAppealsResponse = ApiSuccessResponse & { data: AdminAppeal[]; meta: PaginationMeta }
export type ReviewAppealResponse = ApiSuccessResponse & { data: AdminAppeal }
