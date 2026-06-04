import type { AiCopilotSessionContext, AiCopilotMessage } from '@/types/models/ai-copilot.model'
import type { ApiSuccessResponseWithData } from '@/types/common/http-response.type'
import type { AI_COPILOT_SSE_EVENT_TYPES } from '@/constants/ai/copilot'

export interface StartAiCopilotSessionReqBodyDto {
    upload_session_uuid?: string
    post_uuid?: string
    post_id?: number
    video_size_bytes?: number
    locale?: string
    context_snapshot?: AiCopilotSessionContext
}

export interface AiCopilotTimelineAttachmentDto {
    start_seconds: number
    end_seconds: number
}

export interface SendAiCopilotMessageAttachmentsDto {
    timeline?: AiCopilotTimelineAttachmentDto
    frames?: string[]
    video_clip?: string
}

export interface SendAiCopilotMessageReqBodyDto {
    sessionUuid: string
    content: string
    attachments?: SendAiCopilotMessageAttachmentsDto
}

export interface StreamingMessageDataDto {
    streaming: true
    message_uuid: string
    stream_token: string
    stream_url: string
}

export type SendAiCopilotMessageDataDto = StreamingMessageDataDto | AiCopilotMessage

export type SendAiCopilotMessageResDto = ApiSuccessResponseWithData<SendAiCopilotMessageDataDto>

export interface AiCopilotSseEventDto {
    type: (typeof AI_COPILOT_SSE_EVENT_TYPES)[keyof typeof AI_COPILOT_SSE_EVENT_TYPES]
    delta?: string
    message?: AiCopilotMessage
}
