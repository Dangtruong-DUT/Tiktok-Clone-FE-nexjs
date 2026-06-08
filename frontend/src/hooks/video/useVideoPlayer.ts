'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setIsMute, setVolume as setVolumeToStore } from '@/store/features/videoSlice'
import { useCallback, useEffect, useState } from 'react'
import { logger } from '@/utils/logger.util'

interface UseVideoPlayerOptions {
    onVideoEnd?: () => void
}

export function useVideoPlayer(
    videoRef: React.RefObject<HTMLVideoElement | null>,
    options: UseVideoPlayerOptions = {}
) {
    const [isPlaying, setIsPlaying] = useState(true)
    const isMuted = useAppSelector((state) => state.video.isMuted)
    const dispatch = useAppDispatch()
    const setIsMuted = useCallback(
        (value: boolean) => {
            dispatch(setIsMute(value))
        },
        [dispatch]
    )
    const volume = useAppSelector((state) => state.video.volume)
    const setVolume = useCallback(
        (value: number) => {
            dispatch(setVolumeToStore(value))
        },
        [dispatch]
    )
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const { onVideoEnd } = options

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const onWaiting = () => setIsLoading(true)
        const onCanPlay = () => setIsLoading(false)
        const onPlaying = () => setIsLoading(false)

        video.addEventListener('waiting', onWaiting)
        video.addEventListener('canplay', onCanPlay)
        video.addEventListener('playing', onPlaying)

        return () => {
            video.removeEventListener('waiting', onWaiting)
            video.removeEventListener('canplay', onCanPlay)
            video.removeEventListener('playing', onPlaying)
        }
    }, [videoRef])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const updateTime = () => setCurrentTime(video.currentTime)
        const updateDuration = () => setDuration(video.duration)
        const handleVideoEnd = () => {
            setIsPlaying(false)
            if (onVideoEnd) {
                onVideoEnd()
            } else {
                video.currentTime = 0
                video
                    .play()
                    .then(() => {
                        setIsPlaying(true)
                    })
                    .catch((e) => logger.error(e))
            }
        }

        video.addEventListener('timeupdate', updateTime)
        video.addEventListener('loadedmetadata', updateDuration)
        video.addEventListener('ended', handleVideoEnd)

        if (video.readyState >= 1 && video.duration) {
            setDuration(video.duration)
        }

        return () => {
            video.removeEventListener('timeupdate', updateTime)
            video.removeEventListener('loadedmetadata', updateDuration)
            video.removeEventListener('ended', handleVideoEnd)
        }
    }, [videoRef, onVideoEnd])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handlePlay = () => setIsPlaying(true)
        const handlePause = () => setIsPlaying(false)

        video.addEventListener('play', handlePlay)
        video.addEventListener('pause', handlePause)

        return () => {
            video.removeEventListener('play', handlePlay)
            video.removeEventListener('pause', handlePause)
        }
    }, [videoRef, setIsPlaying])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handleVolumeChange = () => setIsMuted(video.muted)
        video.addEventListener('volumechange', handleVolumeChange)

        return () => {
            video.removeEventListener('volumechange', handleVolumeChange)
        }
    }, [videoRef, setIsMuted])

    return {
        isPlaying,
        setIsPlaying,
        isMuted,
        setIsMuted,
        volume,
        setVolume,
        currentTime,
        duration,
        isLoading
    }
}
