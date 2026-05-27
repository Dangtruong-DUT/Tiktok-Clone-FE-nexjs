'use client'

import Hls from 'hls.js'
import type { ErrorData, LevelSwitchedData, ManifestParsedData } from 'hls.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { logger } from '@/utils/logger.util'

export interface HlsQualityLevel {
    index: number
    height: number
    width: number
    bitrate: number
    name: string
}

interface UseHlsPlayerOptions {
    onReady?: () => void
    onError?: (data: ErrorData) => void
}

export function useHlsPlayer(
    videoRef: React.RefObject<HTMLVideoElement | null>,
    hlsUrl: string | null | undefined,
    options: UseHlsPlayerOptions = {}
) {
    const hlsRef = useRef<Hls | null>(null)
    const [qualityLevels, setQualityLevels] = useState<HlsQualityLevel[]>([])
    const [currentLevel, setCurrentLevel] = useState<number>(-1) // -1 = auto
    const [isHlsReady, setIsHlsReady] = useState(false)
    const [hlsError, setHlsError] = useState<string | null>(null)

    const { onReady, onError } = options

    useEffect(() => {
        const video = videoRef.current
        if (!video || !hlsUrl) return

        setIsHlsReady(false)
        setHlsError(null)

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                startLevel: -1, // auto-start quality
                backBufferLength: 30,
                maxBufferLength: 30,
                maxMaxBufferLength: 120,
                abrEwmaDefaultEstimate: 1_000_000,
                abrBandWidthFactor: 0.9,
                abrBandWidthUpFactor: 0.7,
                fragLoadingTimeOut: 20000,
                manifestLoadingTimeOut: 10000,
                levelLoadingTimeOut: 10000,
            })

            hls.loadSource(hlsUrl)
            hls.attachMedia(video)

            const onManifestParsed = (_evt: string, data: ManifestParsedData) => {
                const levels: HlsQualityLevel[] = data.levels.map((level, index) => ({
                    index,
                    height: level.height,
                    width: level.width,
                    bitrate: level.bitrate,
                    name: `${level.height}p`,
                }))
                setQualityLevels(levels)
                setIsHlsReady(true)
                onReady?.()
            }

            const onLevelSwitched = (_evt: string, data: LevelSwitchedData) => {
                setCurrentLevel(data.level)
            }

            const onHlsError = (_evt: string, data: ErrorData) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            logger.error('HLS: fatal network error, attempting recovery')
                            hls.startLoad()
                            break
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            logger.error('HLS: fatal media error, attempting recovery')
                            hls.recoverMediaError()
                            break
                        default:
                            logger.error('HLS: unrecoverable error', data)
                            hls.destroy()
                            setHlsError('Video unavailable. Please try again.')
                    }
                }
                onError?.(data)
            }

            hls.on(Hls.Events.MANIFEST_PARSED, onManifestParsed)
            hls.on(Hls.Events.LEVEL_SWITCHED, onLevelSwitched)
            hls.on(Hls.Events.ERROR, onHlsError)

            hlsRef.current = hls
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari — native HLS support, no hls.js needed
            video.src = hlsUrl
            setIsHlsReady(true)
            onReady?.()
        } else {
            setHlsError('HLS playback is not supported in this browser.')
        }

        return () => {
            hlsRef.current?.destroy()
            hlsRef.current = null
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hlsUrl, videoRef])

    const switchLevel = useCallback((levelIndex: number) => {
        if (hlsRef.current) {
            hlsRef.current.currentLevel = levelIndex
            setCurrentLevel(levelIndex)
        }
    }, [])

    const switchToAuto = useCallback(() => {
        if (hlsRef.current) {
            hlsRef.current.currentLevel = -1
            setCurrentLevel(-1)
        }
    }, [])

    return {
        isHlsReady,
        hlsError,
        qualityLevels,
        currentLevel,
        switchLevel,
        switchToAuto,
    }
}
