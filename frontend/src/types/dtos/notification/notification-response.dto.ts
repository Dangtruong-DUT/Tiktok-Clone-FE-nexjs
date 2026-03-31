import { HttpResponseWithData, HttpResponseWithMeta } from '@/types/common/http-response.type'
import { PaginationMeta } from '@/types/common/pagination-meta.type'
import { NotificationType } from '@/types/models/notification.model'

export type GetListNotificationResType = HttpResponseWithMeta<NotificationType[], PaginationMeta>

export type GetUnreadCountNotificationResType = HttpResponseWithData<{
    unread_count: number
}>

export type MarkAllNotificationAsReadResType = HttpResponseWithData<{
    updated_count: number
}>
