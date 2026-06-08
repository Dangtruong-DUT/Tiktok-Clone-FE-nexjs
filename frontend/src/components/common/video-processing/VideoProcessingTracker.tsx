'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearStaleEncodings, isTerminalStatus } from '@/store/features/videoProcessingSlice'
import { VideoEncodingPoller } from '@/components/common/video-processing/VideoEncodingPoller'

export function VideoProcessingTracker() {
    const dispatch = useAppDispatch()
    const tracked = useAppSelector((s) => s.videoProcessing.tracked)

    useEffect(() => {
        dispatch(clearStaleEncodings())
    }, [dispatch])

    const pending = tracked.filter((e) => !isTerminalStatus(e.status))

    return (
        <>
            {pending.map((enc) => (
                <VideoEncodingPoller key={enc.sessionUuid} encoding={enc} />
            ))}
        </>
    )
}
