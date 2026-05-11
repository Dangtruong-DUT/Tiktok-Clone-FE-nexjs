import type { ApiSuccessResponse } from '@/types/common/http-response.type'
import type { PaginationMeta } from '@/types/common/pagination-meta.type'

export type AdminUser = {
    readonly id: number
    readonly uuid: string
    readonly username: string
    readonly email: string
    readonly avatar: string | null
    readonly created_at: string
    readonly banned_at: string | null
    readonly ban_reason: string | null
    readonly ban_duration_days?: number | null
    readonly ban_expires_at?: string | null
    readonly deleted_at: string | null
}

export type GetAdminUsersRes = ApiSuccessResponse & { data: AdminUser[]; meta: PaginationMeta }
export type BanUserRes = ApiSuccessResponse & { data: AdminUser }
export type UnbanUserRes = ApiSuccessResponse & { data: AdminUser }
export type RestoreUserRes = ApiSuccessResponse & { data: AdminUser }
export type DeleteUserRes = ApiSuccessResponse
export type CommonMessageRes = ApiSuccessResponse
