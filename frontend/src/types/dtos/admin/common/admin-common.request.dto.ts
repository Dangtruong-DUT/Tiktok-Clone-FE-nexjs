import { z } from 'zod'

export const AdminResourceTypeSchema = z.enum(['user', 'post', 'comment', 'message', 'appeal'])

export type AdminResourceType = z.infer<typeof AdminResourceTypeSchema>
