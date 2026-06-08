'use client'

import { useEffect } from 'react'
import { useInViewport } from '@/hooks/ui/useInViewport'
import { logger } from '@/utils/logger.util'

interface UseVideoAutoPlayProps {
    videoRef: React.RefObject<HTMLVideoElement | null>
    threshold?: number
}

export function useVideoAutoPlay({ videoRef, threshold = 0.5 }: UseVideoAutoPlayProps) {
    const isInViewport = useInViewport(videoRef, threshold)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const tryPlay = () => {
            if (isInViewport) {
                video.play().catch((error) => {
                    logger.error('Error attempting to play video:', error)
                })
            }
        }

        // canplay fires when the browser / hls.js has buffered enough data to start.
        // For HLS videos the first play() call often happens before hls.js has loaded
        // any segments, so it silently fails. Listening for canplay lets us retry.
        video.addEventListener('canplay', tryPlay)

        if (isInViewport) {
            video.play().catch((error) => {
                logger.error('Error attempting to play video:', error)
            })
        } else {
            video.pause()
        }

        return () => {
            video.removeEventListener('canplay', tryPlay)
        }
    }, [isInViewport, videoRef])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handleVisibilityChange = () => {
            if (document.hidden) {
                video.pause()
            } else {
                if (isInViewport) {
                    video.play().catch((error) => {
                        logger.error('Error attempting to play video:', error)
                    })
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [isInViewport, videoRef])

    return { isInViewport }
}
