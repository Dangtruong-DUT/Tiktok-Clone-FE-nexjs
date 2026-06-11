'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useStartSessionMutation, useGetSessionQuery } from '@/store/services/ai/ai-copilot.service'
import { useAiCopilotContext } from '../AiCopilotContext'
import type { AiCopilotSession } from '@/types/models/ai-copilot.model'
import type { StartSessionPayload } from '@/store/services/ai/ai-copilot.service'

interface UseCopilotSessionOptions {
    /** Fired when the session is ready (new or resumed) */
    onReady?: (session: AiCopilotSession) => void
}

export function useCopilotSession(options: UseCopilotSessionOptions = {}) {
    const { videoContext } = useAiCopilotContext()
    const [sessionUuid, setSessionUuid] = useState<string | null>(null)
    const startedRef = useRef(false)

    const [startSession, { isLoading: isStarting }] = useStartSessionMutation()

    const { data: sessionData, isLoading: isLoadingSession } = useGetSessionQuery(sessionUuid!, {
        skip: !sessionUuid
    })

    const session = sessionData?.data ?? null

    const start = useCallback(
        async (extra: Partial<StartSessionPayload> = {}) => {
            if (startedRef.current) return
            startedRef.current = true

            try {
                const res = await startSession({
                    context_snapshot: {
                        video_title: videoContext.video_title,
                        video_description: videoContext.video_description,
                        video_category: videoContext.video_category,
                        video_transcript: videoContext.video_transcript,
                        ocr_text: videoContext.ocr_text,
                        creator_language: videoContext.creator_language ?? 'vi',
                        upload_session_uuid: videoContext.upload_session_uuid
                    },
                    ...extra
                }).unwrap()

                setSessionUuid(res.data.uuid)
                options.onReady?.(res.data)
            } catch {
                startedRef.current = false
            }
        },
        [startSession, videoContext, options]
    )

    const reset = useCallback(() => {
        startedRef.current = false
        setSessionUuid(null)
    }, [])

    // Refresh context when video changes
    useEffect(() => {
        if (sessionUuid && videoContext.upload_session_uuid) {
            // Context updates are reflected on the next message — no re-start needed
        }
    }, [videoContext, sessionUuid])

    return {
        session,
        sessionUuid,
        isLoading: isStarting || isLoadingSession,
        start,
        reset
    }
}
