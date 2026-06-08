import { z } from 'zod'
import { ADMIN_RESOURCE_TYPES } from '@/constants/admin/actions'
import type { AdminResourceType } from '@/constants/admin/actions'

export const AdminResourceTypeSchema = z.enum(
    Object.values(ADMIN_RESOURCE_TYPES) as [AdminResourceType, ...AdminResourceType[]]
)
