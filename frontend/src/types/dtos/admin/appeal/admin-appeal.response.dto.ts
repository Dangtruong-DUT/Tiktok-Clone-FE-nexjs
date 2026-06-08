import type { ApiSuccessResponseWithData, ApiSuccessResponseWithMeta } from '@/types/common/http-response.type'
import type { AdminAppeal } from '@/types/models/admin-appeal.model'

export type GetAdminAppealsResponse = ApiSuccessResponseWithMeta<AdminAppeal[]>
export type ReviewAppealResponse = ApiSuccessResponseWithData<AdminAppeal>
