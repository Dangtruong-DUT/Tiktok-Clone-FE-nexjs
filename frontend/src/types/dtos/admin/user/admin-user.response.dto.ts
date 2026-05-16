import type {
    ApiSuccessResponse,
    ApiSuccessResponseWithData,
    ApiSuccessResponseWithMeta
} from '@/types/common/http-response.type'

export interface AdminUser {
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

export type GetAdminUsersRes = ApiSuccessResponseWithMeta<AdminUser[]>
export type BanUserRes = ApiSuccessResponseWithData<AdminUser>
export type UnbanUserRes = ApiSuccessResponseWithData<AdminUser>
export type RestoreUserRes = ApiSuccessResponseWithData<AdminUser>
export type DeleteUserRes = ApiSuccessResponse
export type CommonMessageRes = ApiSuccessResponse
