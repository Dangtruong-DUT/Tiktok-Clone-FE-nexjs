'use client'

import { useEffect, useRef } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { addVideoSeconds } from '@/store/features/wellnessSlice'
import { useUpdateVideoTimeMutation } from '@/store/services/wellness/screen-time.service'

const VIDEO_FLUSH_INTERVAL_MS = 30_000

export function useVideoTracker(sessionUuid: string | null): {
    addVideoSeconds: (seconds: number) => void
} {
    const dispatch = useAppDispatch()
    const [updateVideoTime] = useUpdateVideoTimeMutation()
    const updateVideoTimeRef = useRef(updateVideoTime)
    useEffect(() => {
        updateVideoTimeRef.current = updateVideoTime
    }, [updateVideoTime])

    const videoAccumulatorRef = useRef(0)

    useEffect(() => {
        if (!sessionUuid) return

        const interval = setInterval(() => {
            const secs = videoAccumulatorRef.current
            if (secs > 0) {
                updateVideoTimeRef.current({ uuid: sessionUuid, video_seconds: secs }).catch(() => {})
                dispatch(addVideoSeconds(secs))
                videoAccumulatorRef.current = 0
            }
        }, VIDEO_FLUSH_INTERVAL_MS)

        return () => clearInterval(interval)
    }, [sessionUuid, dispatch])

    return {
        addVideoSeconds: (seconds: number) => {
            videoAccumulatorRef.current += seconds
        }
    }
}
