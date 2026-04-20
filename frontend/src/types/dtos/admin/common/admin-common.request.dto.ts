import { z } from 'zod'
import { ADMIN_RESOURCE_TYPES, AdminResourceType as AdminResourceTypeValue } from '@/constants/admin.const'

export const AdminResourceTypeSchema = z.enum(
    Object.values(ADMIN_RESOURCE_TYPES) as [AdminResourceTypeValue, ...AdminResourceTypeValue[]]
)

export type AdminResourceType = z.infer<typeof AdminResourceTypeSchema>
