import { z } from 'zod'
import { PaginationMetaSchema } from '@/types/common/pagination-meta.type'

export const HttpResponseSchema = z
    .object({
        status: z.boolean(),
        message: z.string()
    })
    .strict()

export const HttpResponseWithDataSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    HttpResponseSchema.extend({
        data: dataSchema
    }).strict()

export const HttpResponseWithMetaSchema = <T extends z.ZodTypeAny, M extends z.ZodTypeAny>({
    dataSchema,
    metaSchema
}: {
    dataSchema: T
    metaSchema: M
}) =>
    HttpResponseSchema.extend({
        data: dataSchema,
        meta: metaSchema
    }).strict()

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
    ApiSuccessResponseSchema.extend({
        data: dataSchema
    }).strict()

export const ApiSuccessResponseWithMetaSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    ApiSuccessResponseSchema.extend({
        data: dataSchema,
        meta: PaginationMetaSchema
    }).strict()

export type HttpResponse = z.infer<typeof HttpResponseSchema>
export type HttpResponseWithData<T> = HttpResponse & { data: T }
export type HttpResponseWithMeta<T, M> = HttpResponseWithData<T> & { meta: M }
export type HttpResponseWithError = HttpResponseWithBusinessExceptions
export type BusinessException = z.infer<typeof BusinessExceptionSchema>
export type HttpResponseWithBusinessExceptions = z.infer<typeof HttpResponseWithBusinessExceptionsSchema>
export type ApiSuccessResponse = z.infer<typeof ApiSuccessResponseSchema>
