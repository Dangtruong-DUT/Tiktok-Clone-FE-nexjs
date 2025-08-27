"use client";

import { useEffect, useState } from "react";

interface UseVideoPlayerOptions {
    onVideoEnd?: () => void;
}

export function useVideoPlayer(
    videoRef: React.RefObject<HTMLVideoElement | null>,
    options: UseVideoPlayerOptions = {}
) {
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const { onVideoEnd } = options;

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateTime = () => setCurrentTime(video.currentTime);
        const updateDuration = () => setDuration(video.duration);
        const handleVideoEnd = () => {
            setIsPlaying(false);
            if (onVideoEnd) {
                onVideoEnd();
            } else {
                // Default behavior: restart the video
                video.currentTime = 0;
                video
                    .play()
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch(console.error);
            }
        };

        video.addEventListener("timeupdate", updateTime);
        video.addEventListener("loadedmetadata", updateDuration);
        video.addEventListener("ended", handleVideoEnd);

        if (video.readyState >= 1 && video.duration) {
            setDuration(video.duration);
        }

        return () => {
            video.removeEventListener("timeupdate", updateTime);
            video.removeEventListener("loadedmetadata", updateDuration);
            video.removeEventListener("ended", handleVideoEnd);
        };
    }, [videoRef, onVideoEnd]);

    // Add an effect to sync video state with isPlaying state
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);

        return () => {
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
        };
    }, [videoRef, setIsPlaying]);

    // Add an effect to sync video state with isMuted state
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleVolumeChange = () => setIsMuted(video.muted);
        video.addEventListener("volumechange", handleVolumeChange);

        return () => {
            video.removeEventListener("volumechange", handleVolumeChange);
        };
    }, [videoRef, setIsMuted]);

    return {
        isPlaying,
        setIsPlaying,
        isMuted,
        setIsMuted,
        volume,
        setVolume,
        currentTime,
        duration,
    };
}
