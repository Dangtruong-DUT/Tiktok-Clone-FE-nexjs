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
    bitrateLabel: string
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
    const [isBuffering, setIsBuffering] = useState(false)

    const { onReady, onError } = options

    useEffect(() => {
        const video = videoRef.current
        if (!video || !hlsUrl) return

        setIsHlsReady(false)
        setHlsError(null)
        setQualityLevels([])
        setCurrentLevel(-1)
        setIsBuffering(false)

        const onWaiting = () => setIsBuffering(true)
        const onPlaying = () => setIsBuffering(false)
        const onCanPlay = () => setIsBuffering(false)
        const onSeeking = () => setIsBuffering(true)
        const onSeeked = () => setIsBuffering(false)

        video.addEventListener('waiting', onWaiting)
        video.addEventListener('playing', onPlaying)
        video.addEventListener('canplay', onCanPlay)
        video.addEventListener('seeking', onSeeking)
        video.addEventListener('seeked', onSeeked)

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                startLevel: -1,
                backBufferLength: 30,
                maxBufferLength: 30,
                maxMaxBufferLength: 120,
                abrEwmaDefaultEstimate: 1_000_000,
                abrBandWidthFactor: 0.9,
                abrBandWidthUpFactor: 0.7,
                fragLoadingTimeOut: 20000,
                manifestLoadingTimeOut: 10000,
                levelLoadingTimeOut: 10000
            })

            hls.loadSource(hlsUrl)
            hls.attachMedia(video)

            const onManifestParsed = (_evt: string, data: ManifestParsedData) => {
                const levels: HlsQualityLevel[] = data.levels.map((level, index) => ({
                    index,
                    height: level.height,
                    width: level.width,
                    bitrate: level.bitrate,
                    name: `${Math.min(level.height, level.width)}p`,
                    bitrateLabel: formatBitrate(level.bitrate)
                }))
                setQualityLevels(levels)
                setIsHlsReady(true)
                onReady?.()
            }

            const onLevelSwitching = () => setIsBuffering(true)

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
                            setHlsError('Video không khả dụng. Vui lòng thử lại.')
                    }
                }
                onError?.(data)
            }

            hls.on(Hls.Events.MANIFEST_PARSED, onManifestParsed)
            hls.on(Hls.Events.LEVEL_SWITCHING, onLevelSwitching)
            hls.on(Hls.Events.LEVEL_SWITCHED, onLevelSwitched)
            hls.on(Hls.Events.ERROR, onHlsError)

            hlsRef.current = hls
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = hlsUrl
            setIsHlsReady(true)
            onReady?.()
        } else {
            setHlsError('Trình duyệt không hỗ trợ HLS.')
        }

        return () => {
            video.removeEventListener('waiting', onWaiting)
            video.removeEventListener('playing', onPlaying)
            video.removeEventListener('canplay', onCanPlay)
            video.removeEventListener('seeking', onSeeking)
            video.removeEventListener('seeked', onSeeked)
            hlsRef.current?.destroy()
            hlsRef.current = null
        }
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
        isBuffering,
        qualityLevels,
        currentLevel,
        switchLevel,
        switchToAuto
    }
}

function formatBitrate(bps: number): string {
    if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(1)} Mbps`
    return `${Math.round(bps / 1000)} kbps`
}
