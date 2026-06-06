'use client'

import { useCallback, useRef, useState } from 'react'
import {
    useSendMessageMutation,
    useAcceptMessageMutation,
    useRejectMessageMutation,
    type StreamingMessageData
} from '@/store/services/ai-copilot.service'
import { useAiCopilotContext } from '../AiCopilotContext'
import { clipVideoSegment } from '../attachments/VideoAnalysisTimeline'
import type { AiCopilotMessage } from '@/types/models/ai-copilot.model'
import type { AiCopilotSseEventDto, SendAiCopilotMessageAttachmentsDto } from '@/types/dtos/ai/ai-copilot.dto'
import { AI_COPILOT_MESSAGE_STATUSES, AI_COPILOT_ROLES, AI_COPILOT_SSE_EVENT_TYPES } from '@/constants/ai/copilot'

const ANALYZE_KEYWORDS = [
    'phân tích', 'cải thiện', 'improve', 'analyze', 'analyse',
    'hook', 'retention', 'viral', 'caption', 'hashtag',
    'gợi ý', 'đề xuất', 'suggest', 'review', 'xem xét',
    'giúp tôi', 'help me', 'nhận xét', 'feedback'
]

function hasAnalyzeKeyword(text: string): boolean {
    const lower = text.toLowerCase()
    return ANALYZE_KEYWORDS.some((kw) => lower.includes(kw))
}

interface UseAiCopilotOptions {
    sessionUuid: string | null
}

export function useAiCopilot({ sessionUuid }: UseAiCopilotOptions) {
    const {
        pendingVideoClip,
        setPendingVideoClip,
        timelineSelection,
        setTimelineSelection,
        applyToForm,
        videoContext,
        videoRef
    } = useAiCopilotContext()

    const [messages, setMessages] = useState<AiCopilotMessage[]>([])
    const [isSending, setIsSending] = useState(false)
    const esRef = useRef<EventSource | null>(null)

    const [sendMessage] = useSendMessageMutation()
    const [acceptMessage] = useAcceptMessageMutation()
    const [rejectMessage] = useRejectMessageMutation()

    const initFromSession = useCallback((sessionMessages: AiCopilotMessage[]) => {
        setMessages(sessionMessages)
    }, [])

    const openEventSource = useCallback(
        (streamUrl: string, streamToken: string, messageUuid: string) => {
            esRef.current?.close()

            // stream_url from Laravel's route() is already absolute
            const fullUrl = `${streamUrl}?token=${encodeURIComponent(streamToken)}`

            const es = new EventSource(fullUrl, { withCredentials: true })
            esRef.current = es

            es.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data as string) as AiCopilotSseEventDto

                    if (payload.type === AI_COPILOT_SSE_EVENT_TYPES.CHUNK && payload.delta) {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.uuid === messageUuid
                                    ? { ...m, streamingContent: (m.streamingContent ?? '') + payload.delta }
                                    : m
                            )
                        )
                    } else if (payload.type === AI_COPILOT_SSE_EVENT_TYPES.DONE && payload.message) {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.uuid === messageUuid
                                    ? { ...payload.message!, isStreaming: false, streamingContent: undefined }
                                    : m
                            )
                        )
                        setIsSending(false)
                        es.close()
                    }
                } catch {
                    // malformed SSE data
                }
            }

            es.onerror = () => {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.uuid === messageUuid
                            ? { ...m, isStreaming: false, status: AI_COPILOT_MESSAGE_STATUSES.FAILED }
                            : m
                    )
                )
                setIsSending(false)
                es.close()
            }
        },
        [setIsSending]
    )

    const send = useCallback(
        async (content: string) => {
            if (!sessionUuid || isSending) return

            setIsSending(true)

            const userMsg: AiCopilotMessage = {
                uuid: `local-${Date.now()}`,
                role: AI_COPILOT_ROLES.USER,
                content,
                status: AI_COPILOT_MESSAGE_STATUSES.SUCCESS,
                created_at: new Date().toISOString()
            }
            setMessages((prev) => [...prev, userMsg])

            // Auto-capture a short clip if the user is asking for analysis but hasn't selected a segment
            let autoClip: string | null = null
            const vidEl = videoRef?.current ?? null
            if (!pendingVideoClip && !timelineSelection && hasAnalyzeKeyword(content) && vidEl) {
                const vid = vidEl
                const clipEnd = Math.min(15, vid.duration || 15)
                if (clipEnd > 2) {
                    autoClip = await clipVideoSegment(vid, 0, clipEnd)
                }
            }

            const attachments: SendAiCopilotMessageAttachmentsDto = {}
            const effectiveClip = pendingVideoClip ?? autoClip
            if (effectiveClip) attachments.video_clip = effectiveClip
            if (timelineSelection) {
                attachments.timeline = {
                    start_seconds: timelineSelection.start,
                    end_seconds: timelineSelection.end
                }
            }

            // Build live form content snapshot — AI uses this to know what the creator is currently writing
            const currentContent: Record<string, string> = {}
            if (videoContext.video_description) currentContent.caption = videoContext.video_description
            if (videoContext.video_title) currentContent.title = videoContext.video_title
            if (videoContext.video_category) currentContent.hashtags = videoContext.video_category

            setPendingVideoClip(null)
            setTimelineSelection(null)

            let tookStreamingPath = false

            try {
                const res = await sendMessage({
                    sessionUuid,
                    content,
                    attachments: Object.keys(attachments).length > 0 ? attachments : undefined,
                    current_content: Object.keys(currentContent).length > 0 ? currentContent : undefined
                }).unwrap()

                const payload = res.data
                const isStreaming = (payload as StreamingMessageData).streaming === true

                if (isStreaming) {
                    tookStreamingPath = true
                    const streamData = payload as StreamingMessageData

                    const placeholder: AiCopilotMessage = {
                        uuid: streamData.message_uuid,
                        role: AI_COPILOT_ROLES.ASSISTANT,
                        content: '',
                        status: AI_COPILOT_MESSAGE_STATUSES.SUCCESS,
                        created_at: new Date().toISOString(),
                        isStreaming: true,
                        streamingContent: ''
                    }
                    setMessages((prev) => [...prev, placeholder])

                    openEventSource(streamData.stream_url, streamData.stream_token, streamData.message_uuid)
                } else {
                    setMessages((prev) => [...prev, payload as AiCopilotMessage])
                }
            } catch {
                setMessages((prev) => [
                    ...prev,
                    {
                        uuid: `err-${Date.now()}`,
                        role: AI_COPILOT_ROLES.ASSISTANT,
                        content: 'Something went wrong. Please try again.',
                        status: AI_COPILOT_MESSAGE_STATUSES.FAILED,
                        created_at: new Date().toISOString()
                    }
                ])
            } finally {
                if (!tookStreamingPath) setIsSending(false)
            }
        },
        [
            sessionUuid,
            isSending,
            pendingVideoClip,
            timelineSelection,
            setPendingVideoClip,
            setTimelineSelection,
            sendMessage,
            openEventSource,
            videoContext,
            videoRef
        ]
    )

    const accept = useCallback(
        async (messageUuid: string, field: string, value: string) => {
            applyToForm(field, value)
            setMessages((prev) =>
                prev.map((m) => (m.uuid === messageUuid ? { ...m, status: AI_COPILOT_MESSAGE_STATUSES.ACCEPTED } : m))
            )
            try {
                await acceptMessage({ messageUuid, field })
            } catch {
                /* fire-and-forget */
            }
        },
        [applyToForm, acceptMessage]
    )

    const reject = useCallback(
        async (messageUuid: string) => {
            setMessages((prev) =>
                prev.map((m) => (m.uuid === messageUuid ? { ...m, status: AI_COPILOT_MESSAGE_STATUSES.REJECTED } : m))
            )
            try {
                await rejectMessage(messageUuid)
            } catch {
                /* fire-and-forget */
            }
        },
        [rejectMessage]
    )

    const retry = useCallback(() => {
        // Find the last user message (to re-send it)
        const lastUser = [...messages].reverse().find((m) => m.role === AI_COPILOT_ROLES.USER)
        if (!lastUser) return
        // Remove the failed assistant message before retrying
        setMessages((prev) =>
            prev.filter(
                (m) => !(m.role === AI_COPILOT_ROLES.ASSISTANT && m.status === AI_COPILOT_MESSAGE_STATUSES.FAILED)
            )
        )
        send(lastUser.content)
    }, [messages, send])

    const clearMessages = useCallback(() => {
        esRef.current?.close()
        setMessages([])
        setIsSending(false)
    }, [])

    return { messages, isSending, send, accept, reject, retry, initFromSession, clearMessages }
}
