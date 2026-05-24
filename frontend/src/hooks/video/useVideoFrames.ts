'use client'

import { generateTimeLineFrames, TimelineFrameType } from '@/utils/video.util'
import { useEffect, useState } from 'react'
import { logger } from '@/utils/logger.util'

export default function useVideoFrames(VideoSrc: string | null, frameCount: number) {
    const [frames, setFrames] = useState<TimelineFrameType[]>([])

    useEffect(() => {
        if (!VideoSrc) {
            setFrames([])
            return
        }

        generateTimeLineFrames(VideoSrc, frameCount)
            .then((generatedFrames) => {
                setFrames(generatedFrames)
            })
            .catch((error) => {
                setFrames([])
                logger.error('Error generating frames:', error)
            })
    }, [VideoSrc, frameCount])

    return frames
}
