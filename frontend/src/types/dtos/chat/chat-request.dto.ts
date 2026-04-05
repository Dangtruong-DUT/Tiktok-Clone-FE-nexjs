export type GetConversationsQueryType = {
    page?: number
    per_page?: number
}

export type GetMessagesQueryType = {
    conversation_id: number
    page?: number
    per_page?: number
}

export type CreatePrivateConversationReqType = {
    user_uuid: string
}

export type MessageMediaReqType = {
    file_id: number
    type: number
    order?: number
}

export type SendMessageReqType = {
    conversation_id: number
    content: string
    type: number
    reply_to_id?: number | null
    medias?: MessageMediaReqType[]
}

export type MarkConversationAsReadReqType = {
    conversation_id: number
}
