"use client";

import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { useVideoPlayer } from "@/hooks/video/useVideoPlayer";
import { useVideoControls } from "@/hooks/video/useVideoControls";
import { useVideoAutoPlay } from "@/hooks/video/useVideoAutoPlay";
import { VideoOverlayIcons } from "./components/video-overlay-icons";
import Image from "next/image";
import { VideoControlsBottom } from "@/components/video-player-v2/components/video-controls-bottom";
import useThumbnailGenerator from "@/hooks/ui/generateVideoThumbnail";
import ActionBar from "@/components/action-video-bar-v2";
import { useVideoRouterNavigation } from "@/app/[locale]/(public)/(home)/[username]/video/[id]/_hook/useVideoRouterNavigation";
import NavigationVideo from "@/components/video-player-v2/components/navigation-video";

interface VideoPlayerProps {
    className?: string;
    post: TikTokPostType;
}

export default function VideoPlayer({ className, post }: VideoPlayerProps) {
    const author = post.author;

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isProgressBarActive, setIsProgressBarActive] = useState(false);

    const thumbnailUrl = useThumbnailGenerator(post.medias[0].url);
    const locale = useLocale();

    const { handleVideoEnd } = useVideoRouterNavigation({
        autoPlayNext: true,
    });

    const { isPlaying, setIsPlaying, isMuted, setIsMuted, volume, setVolume, currentTime, duration } = useVideoPlayer(
        videoRef,
        {
            onVideoEnd: handleVideoEnd,
        }
    );

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
            className={cn(
                "block relative top-0 left-0 w-full h-full group cursor-pointer rounded-sm overflow-hidden",
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute inset-0 blur-md opacity-30 transform: scale(11)">
                <Image
                    src={thumbnailUrl || "/images/desktop-wallpaper-tiktok.jpg"}
                    alt={author.username}
                    className="object-cover w-full h-full"
                    layout="fill"
                />
            </div>
            <VideoOverlayIcons
                showPlayPauseIcon={showPlayPauseIcon}
                showMutedIcon={showMutedIcon}
                isPlaying={isPlaying}
                isMuted={isMuted}
            />
            <video
                onClick={handlePlayPause}
                className=" absolute block  top-0 left-0 w-full h-full"
                ref={videoRef}
                playsInline
                loop={true}
                muted={isMuted}
                autoPlay={true}
                key={post._id}
            >
                <source src={post.medias[0].url} type="video/mp4" />
            </video>
            <div className=" absolute bottom-20 right-5 flex flex-col items-center">
                <NavigationVideo />
                <ActionBar post={post} />
            </div>

            <VideoControlsBottom
                post={post}
                locale={locale}
                currentTime={currentTime}
                duration={duration}
                isProgressBarActive={isProgressBarActive}
                onSeek={handleSeek}
                onProgressBarActive={handleProgressBarActive}
                onPlayPause={handlePlayPause}
                isPlaying={isPlaying}
                isMuted={isMuted}
                onMuteToggle={handleMuteToggle}
                volume={volume}
                onVolumeChange={handleVolumeChange}
                isHovered={isHovered}
            />
        </section>
    );
}
