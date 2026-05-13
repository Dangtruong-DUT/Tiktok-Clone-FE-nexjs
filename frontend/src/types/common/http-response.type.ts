import { z } from 'zod'
import { PaginationMetaSchema } from '@/types/common/pagination-meta.type'

// Zod schemas for runtime validation at API boundaries
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
}) => HttpResponseSchema.extend({ data: dataSchema, meta: metaSchema }).strict()

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

// TypeScript types
export type BusinessException = z.infer<typeof BusinessExceptionSchema>

/** Legacy API shape — status: boolean */
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

export interface HttpResponseWithBusinessExceptions extends HttpResponse {
    readonly errors: BusinessException[]
}

/** Current API shape — success: boolean */
export interface ApiSuccessResponse {
    readonly success: boolean
    readonly message: string
}

export interface ApiSuccessResponseWithData<T> extends ApiSuccessResponse {
    readonly data: T
}

export interface ApiSuccessResponseWithMeta<T, M = import('@/types/common/pagination-meta.type').PaginationMeta>
    extends ApiSuccessResponseWithData<T> {
    readonly meta: M
}
