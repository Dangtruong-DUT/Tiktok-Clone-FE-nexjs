import { z } from 'zod'

export const PaginationMetaSchema = z
    .object({
        type: z.enum(['offset', 'simple', 'cursor']),
        current_page: z.number().int().nonnegative(),
        last_page: z.number().int().nonnegative(),
        per_page: z.number().int().positive(),
        total: z.number().int().nonnegative().optional(),
        next_page_url: z.string().nullable().optional(),
        prev_page_url: z.string().nullable().optional()
    })
    .strict()

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>
