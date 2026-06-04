'use client'

import { useCallback, useRef, useState } from 'react'
import { useSendMessageMutation, useAcceptMessageMutation, useRejectMessageMutation } from '@/store/services/ai-copilot.service'
import { useAiCopilotContext } from '../AiCopilotContext'
import type { AiCopilotMessage } from '@/types/models/ai-copilot.model'

interface UseAiCopilotOptions {
    sessionUuid: string | null
}

export function useAiCopilot({ sessionUuid }: UseAiCopilotOptions) {
    const { pendingVideoClip, setPendingVideoClip, timelineSelection, setTimelineSelection, applyToForm } =
        useAiCopilotContext()

    const [messages, setMessages] = useState<AiCopilotMessage[]>([])
    const [isSending, setIsSending] = useState(false)
    const esRef = useRef<EventSource | null>(null)

    const [sendMessage] = useSendMessageMutation()
    const [acceptMessage] = useAcceptMessageMutation()
    const [rejectMessage] = useRejectMessageMutation()

    const initFromSession = useCallback((sessionMessages: AiCopilotMessage[]) => {
        setMessages(sessionMessages)
    }, [])

    // Extracted so it can receive setIsSending and keep the indicator alive during SSE.
    const openEventSource = useCallback(
        (streamUrl: string, streamToken: string, messageUuid: string, _sessUuid: string) => {
            esRef.current?.close()

            // stream_url returned by Laravel's route() is already absolute.
            // Append the auth token as a query param.
            const fullUrl = `${streamUrl}?token=${encodeURIComponent(streamToken)}`

            const es = new EventSource(fullUrl, { withCredentials: true })
            esRef.current = es

            es.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data as string) as {
                        type:     'chunk' | 'done'
                        delta?:   string
                        message?: AiCopilotMessage
                    }

                    if (payload.type === 'chunk' && payload.delta) {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.uuid === messageUuid
                                    ? { ...m, streamingContent: (m.streamingContent ?? '') + payload.delta }
                                    : m,
                            ),
                        )
                    } else if (payload.type === 'done' && payload.message) {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.uuid === messageUuid
                                    ? { ...payload.message!, isStreaming: false, streamingContent: undefined }
                                    : m,
                            ),
                        )
                        setIsSending(false)  // SSE complete — turn off indicator
                        es.close()
                    }
                } catch {
                    // malformed SSE data — ignore
                }
            }

            es.onerror = () => {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.uuid === messageUuid ? { ...m, isStreaming: false, status: 'failed' as const } : m,
                    ),
                )
                setIsSending(false)  // SSE error — turn off indicator
                es.close()
            }
        },
        [setIsSending],
    )

    const send = useCallback(
        async (content: string) => {
            if (!sessionUuid || isSending) return

            setIsSending(true)

            const userMsg: AiCopilotMessage = {
                uuid:       `local-${Date.now()}`,
                role:       'user',
                content,
                status:     'success',
                created_at: new Date().toISOString(),
            }
            setMessages((prev) => [...prev, userMsg])

            const attachments: Record<string, unknown> = {}
            if (pendingVideoClip) attachments.video_clip = pendingVideoClip
            if (timelineSelection) {
                attachments.timeline = {
                    start_seconds: timelineSelection.start,
                    end_seconds:   timelineSelection.end,
                }
            }

            setPendingVideoClip(null)
            setTimelineSelection(null)

            let tookStreamingPath = false

            try {
                const res = await sendMessage({
                    sessionUuid,
                    content,
                    attachments: Object.keys(attachments).length > 0
                        ? (attachments as { frames?: string[]; video_clip?: string; timeline?: { start_seconds: number; end_seconds: number } })
                        : undefined,
                }).unwrap()

                if (res.streaming && res.stream_url && res.stream_token && res.message_uuid) {
                    tookStreamingPath = true   // indicator stays ON — SSE will turn it off

                    const placeholder: AiCopilotMessage = {
                        uuid:             res.message_uuid,
                        role:             'assistant',
                        content:          '',
                        status:           'success',
                        created_at:       new Date().toISOString(),
                        isStreaming:      true,
                        streamingContent: '',
                    }
                    setMessages((prev) => [...prev, placeholder])

                    openEventSource(res.stream_url, res.stream_token, res.message_uuid, sessionUuid)
                } else if (!res.streaming && res.data) {
                    setMessages((prev) => [...prev, res.data!])
                }
            } catch {
                setMessages((prev) => [
                    ...prev,
                    {
                        uuid:       `err-${Date.now()}`,
                        role:       'assistant',
                        content:    'Something went wrong. Please try again.',
                        status:     'failed',
                        created_at: new Date().toISOString(),
                    },
                ])
            } finally {
                // Only reset for non-streaming path; streaming path resets via SSE done/error.
                if (!tookStreamingPath) setIsSending(false)
            }
        },
        [sessionUuid, isSending, pendingVideoClip, timelineSelection, setPendingVideoClip, setTimelineSelection, sendMessage, openEventSource],
    )

    const accept = useCallback(
        async (messageUuid: string, field: string, value: string) => {
            applyToForm(field, value)
            setMessages((prev) =>
                prev.map((m) => (m.uuid === messageUuid ? { ...m, status: 'accepted' as const } : m)),
            )
            try {
                await acceptMessage({ messageUuid, field })
            } catch { /* fire-and-forget */ }
        },
        [applyToForm, acceptMessage],
    )

    const reject = useCallback(
        async (messageUuid: string) => {
            setMessages((prev) =>
                prev.map((m) => (m.uuid === messageUuid ? { ...m, status: 'rejected' as const } : m)),
            )
            try {
                await rejectMessage(messageUuid)
            } catch { /* fire-and-forget */ }
        },
        [rejectMessage],
    )

    return { messages, isSending, send, accept, reject, initFromSession }
}
