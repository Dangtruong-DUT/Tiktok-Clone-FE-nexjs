'use client'

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import {
    useGenerateSuggestionMutation,
    useGetSuggestionQuery,
    useApplySuggestionMutation
} from '@/store/services/ai-content-studio.service'
import { AiContentSuggestionType, AiSuggestionStatus } from '@/types/models/ai-content-suggestion.model'
import { GenerateAiSuggestionReqBodyType } from '@/types/dtos/ai/ai-content-suggestion.dto'

const TERMINAL_STATUSES: AiSuggestionStatus[] = ['completed', 'failed']
const POLL_INTERVAL_MS = 2000

function isTerminal(status?: AiSuggestionStatus): boolean {
    return !!status && TERMINAL_STATUSES.includes(status)
}

interface UseAiContentSuggestionOptions {
    onApplied?: (suggestion: AiContentSuggestionType) => void
}

export function useAiContentSuggestion({ onApplied }: UseAiContentSuggestionOptions = {}) {
    const [pendingUuid, setPendingUuid] = useState<string | null>(null)
    const [toastShown, setToastShown] = useState(false)

    const [generateMutation, { isLoading: isGenerating }] = useGenerateSuggestionMutation()
    const [applyMutation, { isLoading: isApplying }] = useApplySuggestionMutation()

    const { data: pollData, isFetching: isPolling } = useGetSuggestionQuery(pendingUuid ?? '', {
        skip: !pendingUuid,
        pollingInterval: pendingUuid ? POLL_INTERVAL_MS : 0
    })

    const suggestion = pollData?.data ?? null
    const currentStatus = suggestion?.status
    const isCompleted = currentStatus === 'completed'
    const isFailed = currentStatus === 'failed'
    const isActive = isGenerating || (!!pendingUuid && !isTerminal(currentStatus))

    // Stop polling and show toast when terminal status reached
    useEffect(() => {
        if (!suggestion || !pendingUuid || toastShown) return
        if (!isTerminal(currentStatus)) return

        setToastShown(true)
        setPendingUuid(null)

        if (isCompleted) {
            toast.success('AI suggestions are ready!')
        } else if (isFailed) {
            toast.warning(
                suggestion.error_message
                    ? 'AI generation failed — showing fallback suggestions.'
                    : 'AI generation failed.'
            )
        }
    }, [currentStatus, suggestion, pendingUuid, toastShown, isCompleted, isFailed])

    const generate = useCallback(
        async (input: GenerateAiSuggestionReqBodyType) => {
            setPendingUuid(null)
            setToastShown(false)
            try {
                const res = await generateMutation(input).unwrap()
                const uuid = res.data.uuid
                setPendingUuid(uuid)

                if (isTerminal(res.data.status)) {
                    // Already done (cache hit)
                    setPendingUuid(null)
                    toast.success('AI suggestions loaded from cache!')
                }
            } catch {
                toast.error('Failed to start AI generation. Please try again.')
            }
        },
        [generateMutation]
    )

    const regenerate = useCallback(
        (input: GenerateAiSuggestionReqBodyType) => {
            generate({ ...input, regenerate: true })
        },
        [generate]
    )

    const apply = useCallback(async () => {
        if (!suggestion?.uuid) return
        try {
            const res = await applyMutation(suggestion.uuid).unwrap()
            onApplied?.(res.data)
            toast.success('Suggestion applied to your post!')
        } catch {
            toast.error('Failed to apply suggestion.')
        }
    }, [suggestion, applyMutation, onApplied])

    const reset = useCallback(() => {
        setPendingUuid(null)
        setToastShown(false)
    }, [])

    return {
        suggestion,
        isGenerating: isActive,
        isPolling: isPolling && !isTerminal(currentStatus),
        isCompleted,
        isFailed,
        isApplying,
        generate,
        regenerate,
        apply,
        reset
    }
}
