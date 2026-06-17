'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addVideoSeconds as addVideoSecondsAction } from '@/store/features/wellnessSlice'
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

    // Incremental accumulator: resets after each flush
    const videoAccumulatorRef = useRef(0)

    // Cumulative total for this session (synced from Redux) — sent to API
    // because backend uses max(current_db, received) and needs a monotonically
    // increasing value; incremental chunks would cause earlier DB values to win.
    const videoWatchSeconds = useAppSelector((s) => s.wellness.videoWatchSeconds)
    const videoWatchSecondsRef = useRef(videoWatchSeconds)
    useEffect(() => {
        videoWatchSecondsRef.current = videoWatchSeconds
    }, [videoWatchSeconds])

    useEffect(() => {
        if (!sessionUuid) return

        const interval = setInterval(() => {
            const secs = videoAccumulatorRef.current
            if (secs > 0) {
                dispatch(addVideoSecondsAction(secs))
                // Send cumulative total (after Redux update) so backend max() logic works correctly
                updateVideoTimeRef.current({
                    uuid: sessionUuid,
                    video_seconds: videoWatchSecondsRef.current + secs
                }).catch(() => {})
                videoAccumulatorRef.current = 0
            }
        }, VIDEO_FLUSH_INTERVAL_MS)

        return () => clearInterval(interval)
    }, [sessionUuid, dispatch])

    const addVideoSeconds = useCallback((seconds: number) => {
        videoAccumulatorRef.current += seconds
    }, [])

    return { addVideoSeconds }
}
