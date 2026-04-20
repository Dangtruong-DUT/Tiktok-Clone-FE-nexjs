import { z } from 'zod'
import { ApiSuccessResponseWithDataSchema, ApiSuccessResponseWithMetaSchema } from '@/types/common/http-response.type'
import type { ApiSuccessResponse } from '@/types/common/http-response.type'
import type { PaginationMeta } from '@/types/common/pagination-meta.type'
import { AdminAppealSchema } from '@/types/models/admin-appeal.model'

export const GetAdminAppealsResponseSchema = ApiSuccessResponseWithMetaSchema(z.array(AdminAppealSchema))

export const ReviewAppealResponseSchema = ApiSuccessResponseWithDataSchema(AdminAppealSchema)

export type AdminAppeal = z.infer<typeof AdminAppealSchema>
export type GetAdminAppealsResponse = ApiSuccessResponse & { data: AdminAppeal[]; meta: PaginationMeta }
export type ReviewAppealResponse = ApiSuccessResponse & { data: AdminAppeal }
