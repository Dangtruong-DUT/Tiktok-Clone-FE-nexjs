'use client'

import React, { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useLocale } from 'next-intl'
import { TikTokPostType } from '@/types/models/post.model'
import { MediaType } from '@/constants/enum'
import { useVideoPlayer } from '@/hooks/video/useVideoPlayer'
import { useVideoAutoPlay } from '@/hooks/video/useVideoAutoPlay'
import { useVideoControls } from '@/hooks/video/useVideoControls'
import { useHlsPlayer } from '@/hooks/video/useHlsPlayer'
import { VideoControlsTop } from '@/components/feed-video-player/components/video-controls-top'
import { VideoOverlayIcons } from '@/components/feed-video-player/components/video-overlay-icons'
import { VideoControlsBottom } from '@/components/feed-video-player/components/video-controls-bottom'
import LoadingIcon from '@/components/lottie-icons/loading'

interface VideoPlayerProps {
    className?: string
    post: TikTokPostType
}

export default function VideoPlayer({ className, post }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [isHovered, setIsHovered] = useState(false)
    const [isProgressBarActive, setIsProgressBarActive] = useState(false)

    const locale = useLocale()

    const media = post.medias[0]
    const isHls = media?.type === MediaType.HLS_VIDEO
    const hlsUrl = isHls ? media?.url : null

    const { isPlaying, setIsPlaying, isMuted, setIsMuted, volume, setVolume, currentTime, duration, isLoading } =
        useVideoPlayer(videoRef)

    const { qualityLevels, currentLevel, switchLevel, switchToAuto, isBuffering } = useHlsPlayer(
        videoRef,
        isHls ? hlsUrl : null
    )

    useVideoAutoPlay({ videoRef })

    const { handlePlayPause, handleSeek, handleMuteToggle, handleVolumeChange, showPlayPauseIcon, showMutedIcon } =
        useVideoControls({
            videoRef,
            isPlaying,
            isMuted,
            setIsPlaying,
            setIsMuted,
            setVolume
        })

    const handleProgressBarActive = useCallback((active: boolean) => {
        setIsProgressBarActive(active)
    }, [])

    return (
        <section
            className={cn('block relative top-0 left-0 w-full h-full group cursor-pointer', className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <VideoControlsTop
                volume={volume}
                onVolumeChange={handleVolumeChange}
                isMuted={isMuted}
                onMuteToggle={handleMuteToggle}
                isParentHovered={isHovered}
            />

            <VideoOverlayIcons
                showPlayPauseIcon={showPlayPauseIcon}
                showMutedIcon={showMutedIcon}
                isPlaying={isPlaying}
                isMuted={isMuted}
            />

            {(isBuffering || isLoading) && (
                <div className='absolute inset-0 flex items-center justify-center pointer-events-none z-10'>
                    <LoadingIcon loop className='size-12' />
                </div>
            )}

            <video
                onClick={handlePlayPause}
                className='w-full h-full rounded-2xl object-contain bg-accent transition-all duration-400'
                ref={videoRef}
                playsInline
                loop
                preload='metadata'
                muted={isMuted}
                poster={post.thumbnail_url || undefined}
            >
                {!isHls && <source src={media?.url} type='video/mp4' />}
            </video>

            <VideoControlsBottom
                post={post}
                author={post.author}
                locale={locale}
                currentTime={currentTime}
                duration={duration}
                isProgressBarActive={isProgressBarActive}
                onSeek={handleSeek}
                onProgressBarActive={handleProgressBarActive}
                onPlayPause={handlePlayPause}
                qualityLevels={qualityLevels}
                currentLevel={currentLevel}
                onSelectLevel={switchLevel}
                onSelectAuto={switchToAuto}
            />
        </section>
    )
}
