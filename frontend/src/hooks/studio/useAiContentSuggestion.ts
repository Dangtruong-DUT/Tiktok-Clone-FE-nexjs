'use client'

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import {
    useGenerateSuggestionMutation,
    useGetSuggestionQuery,
    useApplySuggestionMutation
} from '@/store/services/ai-content-studio.service'
import { AiSuggestionStatus } from '@/types/models/ai-content-suggestion.model'
import { GenerateAiSuggestionReqBodyType } from '@/types/dtos/ai/ai-content-suggestion.dto'

const TERMINAL_STATUSES: AiSuggestionStatus[] = ['completed', 'failed']
const POLL_INTERVAL_MS = 2000

function isTerminal(status?: AiSuggestionStatus): boolean {
    return !!status && TERMINAL_STATUSES.includes(status)
}

export function useAiContentSuggestion() {
    const [pendingUuid, setPendingUuid]   = useState<string | null>(null)
    const [toastShown, setToastShown]     = useState(false)

    const [generateMutation, { isLoading: isGenerating }] = useGenerateSuggestionMutation()
    const [applyMutation]                                  = useApplySuggestionMutation()

    const { data: pollData } = useGetSuggestionQuery(pendingUuid ?? '', {
        skip:            !pendingUuid,
        pollingInterval: pendingUuid ? POLL_INTERVAL_MS : 0
    })

    const suggestion    = pollData?.data ?? null
    const currentStatus = suggestion?.status
    const isCompleted   = currentStatus === 'completed'
    const isFailed      = currentStatus === 'failed'
    const isActive      = isGenerating || (!!pendingUuid && !isTerminal(currentStatus))

    // Stop polling and show toast on terminal status
    useEffect(() => {
        if (!suggestion || !pendingUuid || toastShown) return
        if (!isTerminal(currentStatus)) return

        setToastShown(true)
        setPendingUuid(null)

        if (isCompleted) {
            toast.success('Gợi ý AI đã sẵn sàng!')
        } else if (isFailed) {
            toast.warning('AI gặp lỗi — đang hiển thị gợi ý dự phòng.')
        }
    }, [currentStatus, suggestion, pendingUuid, toastShown, isCompleted, isFailed])

    const generate = useCallback(
        async (input: Omit<GenerateAiSuggestionReqBodyType, 'creator_language'> & { creator_language?: string }) => {
            setPendingUuid(null)
            setToastShown(false)
            try {
                const res  = await generateMutation(input as GenerateAiSuggestionReqBodyType).unwrap()
                const uuid = res.data.uuid
                setPendingUuid(uuid)

                if (isTerminal(res.data.status)) {
                    setPendingUuid(null)
                    toast.success('Gợi ý AI đã sẵn sàng (cache)!')
                }
            } catch {
                toast.error('Không thể khởi động AI. Vui lòng thử lại.')
            }
        },
        [generateMutation]
    )

    const regenerate = useCallback(
        (input: Parameters<typeof generate>[0]) => generate({ ...input, regenerate: true }),
        [generate]
    )

    /** Call backend to record that the suggestion was applied (analytics). Fire-and-forget. */
    const markApplied = useCallback(
        (uuid: string) => {
            applyMutation(uuid).catch(() => {})
        },
        [applyMutation]
    )

    const reset = useCallback(() => {
        setPendingUuid(null)
        setToastShown(false)
    }, [])

    return {
        suggestion,
        isGenerating: isActive,
        isCompleted,
        isFailed,
        generate,
        regenerate,
        markApplied,
        reset
    }
}
