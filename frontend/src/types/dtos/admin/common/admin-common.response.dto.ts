import { z } from 'zod'

export const AdminApiBaseResponseSchema = z
    .object({
        success: z.boolean(),
        message: z.string()
    })
    .strict()

export const AdminListMetaSchema = z
    .object({
        current_page: z.number().int().nonnegative(),
        last_page: z.number().int().nonnegative(),
        total: z.number().int().nonnegative(),
        per_page: z.number().int().positive()
    })
    .strict()

export type AdminListMeta = z.infer<typeof AdminListMetaSchema>
