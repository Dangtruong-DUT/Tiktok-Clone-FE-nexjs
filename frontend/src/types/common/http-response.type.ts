import { z } from 'zod'
import { PaginationMetaSchema } from '@/types/common/pagination-meta.type'

// ─── Zod schemas (used for runtime validation only) ─────────────────────────

export const HttpResponseSchema = z
    .object({
        status: z.boolean(),
        message: z.string()
    })
    .strict()

export const HttpResponseWithDataSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    HttpResponseSchema.extend({ data: dataSchema }).strict()

export const HttpResponseWithMetaSchema = <T extends z.ZodTypeAny, M extends z.ZodTypeAny>({
    dataSchema,
    metaSchema
}: {
    dataSchema: T
    metaSchema: M
}) =>
    HttpResponseSchema.extend({ data: dataSchema, meta: metaSchema }).strict()

export const BusinessExceptionSchema = z.record(z.string(), z.union([z.string(), z.array(z.string())]))

export const HttpResponseWithBusinessExceptionsSchema = HttpResponseSchema.extend({
    errors: z.array(BusinessExceptionSchema)
}).strict()

export const ApiSuccessResponseSchema = z
    .object({
        success: z.boolean(),
        message: z.string()
    })
    .strict()

export const ApiSuccessResponseWithDataSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    ApiSuccessResponseSchema.extend({ data: dataSchema }).strict()

export const ApiSuccessResponseWithMetaSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    ApiSuccessResponseSchema.extend({ data: dataSchema, meta: PaginationMetaSchema }).strict()

// ─── TypeScript types (source of truth for static typing) ────────────────────

export type BusinessException = z.infer<typeof BusinessExceptionSchema>

/** Base HTTP response from the legacy API shape */
export interface HttpResponse {
    readonly status: boolean
    readonly message: string
}

export interface HttpResponseWithData<T> extends HttpResponse {
    readonly data: T
}

export interface HttpResponseWithMeta<T, M = unknown> extends HttpResponseWithData<T> {
    readonly meta: M
}

export type HttpResponseWithError = HttpResponseWithBusinessExceptions

export interface HttpResponseWithBusinessExceptions extends HttpResponse {
    readonly errors: BusinessException[]
}

/** Base success response (RTK Query / backend v2 shape) */
export interface ApiSuccessResponse {
    readonly success: boolean
    readonly message: string
}

export interface ApiSuccessResponseWithData<T> extends ApiSuccessResponse {
    readonly data: T
}

export interface ApiSuccessResponseWithMeta<T> extends ApiSuccessResponseWithData<T> {
    readonly meta: import('@/types/common/pagination-meta.type').PaginationMeta
}
