"use client";

import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { UserType } from "@/types/schemas/User.schema";
import { useVideoPlayer } from "@/hooks/video/useVideoPlayer";
import { useVideoControls } from "@/hooks/video/useVideoControls";
import { useVideoAutoPlay } from "@/hooks/video/useVideoAutoPlay";
import { useVideoRouterNavigation } from "@/hooks/video/useVideoRouterNavigation";
import { useVideoPlaylist } from "@/provider/video-playlist-provider";
import { VideoOverlayIcons } from "./components/video-overlay-icons";
import Image from "next/image";
import { VideoControlsBottom } from "@/components/video-player-v2/components/video-controls-bottom";
import ActionBar from "@/components/video-player-v2/components/action-video-bar";
import useThumbnailGenerator from "@/hooks/ui/generateVideoThumbnail";
import NavigationVideo from "@/components/video-player-v2/components/navigation-video";

interface VideoPlayerProps {
    className?: string;
    post: TikTokPostType;
    author: UserType;
}

export default function VideoPlayer({ className, post, author }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isProgressBarActive, setIsProgressBarActive] = useState(false);

    const { currentVideo } = useVideoPlaylist();
    const thumbnailUrl = useThumbnailGenerator(currentVideo?.post.medias[0].url || post.medias[0].url);
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

    // Use current video data if available, fallback to props
    const displayPost = currentVideo?.post || post;
    const displayAuthor = currentVideo?.user || author;

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
                    alt={displayAuthor.username}
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
                key={displayPost._id}
            >
                <source src={displayPost.medias[0].url} type="video/mp4" />
            </video>
            <div className=" absolute bottom-20 right-5 flex flex-col items-center">
                <NavigationVideo />
                <ActionBar author={displayAuthor} post={displayPost} />
            </div>

            <VideoControlsBottom
                post={displayPost}
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
