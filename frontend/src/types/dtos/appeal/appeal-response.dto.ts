import { z } from 'zod'
import { ApiSuccessResponseWithDataSchema, ApiSuccessResponseWithMetaSchema } from '@/types/common/http-response.type'
import type { ApiSuccessResponse } from '@/types/common/http-response.type'
import type { PaginationMeta } from '@/types/common/pagination-meta.type'
import { AppealSchema } from '@/types/models/appeal.model'

export const CreateAppealResponseSchema = ApiSuccessResponseWithDataSchema(AppealSchema)

export const GetMyAppealsResponseSchema = ApiSuccessResponseWithMetaSchema(z.array(AppealSchema))

export const GetAppealResponseSchema = ApiSuccessResponseWithDataSchema(AppealSchema)

export type Appeal = z.infer<typeof AppealSchema>
export type AppealListMeta = PaginationMeta
export type CreateAppealResponse = ApiSuccessResponse & { data: Appeal }
export type GetMyAppealsResponse = ApiSuccessResponse & { data: Appeal[]; meta: AppealListMeta }
export type GetAppealResponse = ApiSuccessResponse & { data: Appeal }
