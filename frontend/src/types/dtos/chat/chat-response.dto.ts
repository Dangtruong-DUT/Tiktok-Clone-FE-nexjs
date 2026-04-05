import { HttpResponseWithData, HttpResponseWithMeta } from '@/types/common/http-response.type'
import { PaginationMeta } from '@/types/common/pagination-meta.type'
import { ConversationType } from '@/types/models/conversation.model'
import { MessageType } from '@/types/models/message.model'

export type GetConversationsResType = HttpResponseWithMeta<ConversationType[], PaginationMeta>

export type CreatePrivateConversationResType = HttpResponseWithData<ConversationType>

export type GetMessagesResType = HttpResponseWithMeta<MessageType[], PaginationMeta>

export type SendMessageResType = HttpResponseWithData<MessageType>

export type GetUnreadMessagesCountResType = HttpResponseWithData<{
    unread_count: number
}>
