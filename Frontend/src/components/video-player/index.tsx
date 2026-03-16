"use client";

import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { useVideoPlayer } from "@/hooks/video/useVideoPlayer";
import { useVideoAutoPlay } from "@/hooks/video/useVideoAutoPlay";
import { useVideoControls } from "@/hooks/video/useVideoControls";
import { VideoControlsTop } from "@/components/video-player/components/video-controls-top";
import { VideoOverlayIcons } from "@/components/video-player/components/video-overlay-icons";
import { VideoControlsBottom } from "@/components/video-player/components/video-controls-bottom";
interface VideoPlayerProps {
    className?: string;
    post: TikTokPostType;
}

export default function VideoPlayer({ className, post }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isProgressBarActive, setIsProgressBarActive] = useState(false);

    const locale = useLocale();

    const { isPlaying, setIsPlaying, isMuted, setIsMuted, volume, setVolume, currentTime, duration } =
        useVideoPlayer(videoRef);

    useVideoAutoPlay({ videoRef });

    const { handlePlayPause, handleSeek, handleMuteToggle, handleVolumeChange, showPlayPauseIcon, showMutedIcon } =
        useVideoControls({
            videoRef,
            isPlaying,
            isMuted,
            setIsPlaying,
            setIsMuted,
            setVolume,
        });

    const handleProgressBarActive = useCallback((active: boolean) => {
        setIsProgressBarActive(active);
    }, []);

    return (
        <section
            className={cn("block relative top-0 left-0 w-full h-full group cursor-pointer", className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Video Controls Top */}
            <VideoControlsTop
                volume={volume}
                onVolumeChange={handleVolumeChange}
                isMuted={isMuted}
                onMuteToggle={handleMuteToggle}
                isParentHovered={isHovered}
            />

            {/* Overlay Icons */}
            <VideoOverlayIcons
                showPlayPauseIcon={showPlayPauseIcon}
                showMutedIcon={showMutedIcon}
                isPlaying={isPlaying}
                isMuted={isMuted}
            />

            {/* Video Element */}
            <video
                onClick={handlePlayPause}
                className="w-full aspect-[9/16] rounded-2xl object-cover bg-accent"
                ref={videoRef}
                playsInline
                loop
                preload="metadata"
                muted={isMuted}
            >
                <source src={post.medias[0].url} type="video/mp4" />
            </video>

            {/* Video Controls Bottom */}
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
            />
        </section>
    );
}
