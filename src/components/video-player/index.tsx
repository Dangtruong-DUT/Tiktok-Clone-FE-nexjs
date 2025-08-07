"use client";

import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import VolumeBar from "@/components/video-player/volume-bar";
import VideoDescription from "@/components/video-player/video-description";
import { FaCirclePause, FaCirclePlay } from "react-icons/fa6";
import { HiSpeakerWave } from "react-icons/hi2";
import { FaVolumeMute } from "react-icons/fa";
import { timeAgo } from "@/utils/formating/formatTime";
import { useLocale } from "next-intl";
import ProgressBar from "@/components/video-player/progress-bar";

interface VideoSource {
    file_url: string;
    type: string;
    author: string;
    user: {
        nickname: string;
    };
    description: string;
    created_at: string;
}

interface VideoPlayerProps {
    className?: string;
    post: TikTokPostType;
    author: UserType;
}

export default function VideoPlayer({ className, post, author }: VideoPlayerProps) {
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
                muted={isMuted}
            >
                <source src={post.medias[0].url} type="video/mp4" />
            </video>

            {/* Video Controls Bottom */}
            <VideoControlsBottom
                post={post}
                author={author}
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
