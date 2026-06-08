import { z } from 'zod'

const OffsetPaginationMetaSchema = z.object({
    type: z.literal('offset'),
    current_page: z.number().int().nonnegative(),
    last_page: z.number().int().nonnegative(),
    per_page: z.number().int().positive(),
    total: z.number().int().nonnegative().optional(),
    next_page_url: z.string().nullable().optional(),
    prev_page_url: z.string().nullable().optional()
})

const CursorPaginationMetaSchema = z.object({
    type: z.literal('cursor'),
    per_page: z.number().int().positive(),
    next_cursor: z.string().nullable(),
    prev_cursor: z.string().nullable()
})

const SimplePaginationMetaSchema = z.object({
    type: z.literal('simple'),
    current_page: z.number().int().nonnegative(),
    per_page: z.number().int().positive(),
    next_page_url: z.string().nullable().optional(),
    prev_page_url: z.string().nullable().optional()
})

export const PaginationMetaSchema = z.discriminatedUnion('type', [
    OffsetPaginationMetaSchema,
    CursorPaginationMetaSchema,
    SimplePaginationMetaSchema
])

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>
export type OffsetPaginationMeta = z.infer<typeof OffsetPaginationMetaSchema>
export type CursorPaginationMeta = z.infer<typeof CursorPaginationMetaSchema>
export type SimplePaginationMeta = z.infer<typeof SimplePaginationMetaSchema>
