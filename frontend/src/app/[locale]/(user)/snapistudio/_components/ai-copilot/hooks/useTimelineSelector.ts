'use client'

import { useCallback, useState } from 'react'
import type { AiCopilotTimelineSelection } from '@/types/models/ai-copilot.model'

export function useTimelineSelector(videoDuration: number) {
    const [selection, setSelection] = useState<AiCopilotTimelineSelection | null>(null)

    const setStart = useCallback(
        (seconds: number) => {
            const clamped = Math.max(0, Math.min(seconds, videoDuration))
            setSelection((prev) => ({
                start: clamped,
                end:   prev ? Math.max(clamped + 1, prev.end) : Math.min(clamped + 30, videoDuration),
            }))
        },
        [videoDuration],
    )

    const setEnd = useCallback(
        (seconds: number) => {
            const clamped = Math.max(0, Math.min(seconds, videoDuration))
            setSelection((prev) => ({
                start: prev ? Math.min(prev.start, clamped - 1) : 0,
                end:   clamped,
            }))
        },
        [videoDuration],
    )

    const setRange = useCallback((start: number, end: number) => {
        setSelection({ start, end })
    }, [])

    const clear = useCallback(() => setSelection(null), [])

    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60)
        const s = Math.floor(seconds % 60)
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    return { selection, setStart, setEnd, setRange, clear, formatTime }
}
