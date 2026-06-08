import { z } from 'zod'

export const PaginationQuerySchema = z
    .object({
        page: z.coerce.number().int().positive().optional(),
        per_page: z.coerce.number().int().positive().optional(),
        cursor: z.string().optional()
    })
    .strict()

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>
