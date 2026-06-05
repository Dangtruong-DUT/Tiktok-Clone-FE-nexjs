import type { ApiSuccessResponseWithData, ApiSuccessResponseWithMeta } from '@/types/common/http-response.type'
import type { AdminResourceType } from '@/constants/admin/actions'

interface LogActor {
    readonly id: number
    readonly uuid?: string | null
    readonly username: string
    readonly avatar: string | null
}

export interface AdminLog {
    readonly id: number
    readonly admin_id: number
    readonly admin_uuid?: string | null
    readonly admin?: LogActor
    readonly resource_type: AdminResourceType | null
    readonly resource_id: string | number
    readonly action: string
    readonly reason: string | null
    readonly old_data: Record<string, unknown> | null
    readonly new_data: Record<string, unknown> | null
    readonly ip_address?: string | null
    readonly created_at: string
}

export interface ActivityLog {
    readonly id: number
    readonly user_id: number | null
    readonly user_uuid?: string | null
    readonly user?: LogActor
    readonly action_type: string
    readonly resource_type: AdminResourceType | null
    readonly resource_id: string | number | null
    readonly metadata: Record<string, unknown> | null
    readonly ip_address?: string | null
    readonly created_at: string
}

export type AdminActivityListItem = AdminLog | ActivityLog

export interface DashboardStats {
    readonly total_users: number
    readonly active_users: number
    readonly banned_users: number
    readonly total_posts: number
    readonly deleted_posts: number
    readonly total_comments: number
    readonly total_admin_actions: number
    readonly new_users_this_period: number
    readonly new_posts_this_period: number
    readonly pending_appeals: number
}

export type GetActivityLogsRes = ApiSuccessResponseWithMeta<AdminActivityListItem[]>
export type GetDashboardStatsRes = ApiSuccessResponseWithData<DashboardStats>
