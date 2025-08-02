"use client";

import { useCallback } from "react";
import { useTemporaryIcon } from "@/hooks/ui/useTemporaryIcon";

interface UseVideoControlsProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    setIsMuted: (muted: boolean) => void;
    setVolume: (volume: number) => void;
}

export function useVideoControls({ videoRef, isPlaying, setIsPlaying, setIsMuted, setVolume }: UseVideoControlsProps) {
    const { show: showPlayPauseIcon, trigger: triggerPlayPauseIcon } = useTemporaryIcon(500);
    const { show: showMutedIcon, trigger: triggerMutedIcon } = useTemporaryIcon(500);

    const handlePlayPause = useCallback(
        (event: React.MouseEvent<HTMLVideoElement | HTMLDivElement>) => {
            if (event.target !== videoRef.current) {
                return;
            }
            if (videoRef.current) {
                if (videoRef.current.paused) {
                    videoRef.current.play().catch((error) => {
                        console.error("Error attempting to play video:", error);
                    });
                } else {
                    videoRef.current.pause();
                }
                setIsPlaying(!isPlaying);
                triggerPlayPauseIcon();
            }
        },
        [videoRef, isPlaying, setIsPlaying, triggerPlayPauseIcon]
    );

    const handleSeek = useCallback(
        (time: number) => {
            if (videoRef.current) {
                videoRef.current.currentTime = time;
            }
        },
        [videoRef]
    );

    const handleMuteToggle = useCallback(
        (newMutedState: boolean) => {
            setIsMuted(newMutedState);
            triggerMutedIcon();
            if (videoRef.current) {
                videoRef.current.muted = newMutedState;
            }
        },
        [videoRef, setIsMuted, triggerMutedIcon]
    );

    const handleVolumeChange = useCallback(
        (newVolume: number) => {
            setVolume(newVolume);
            if (newVolume === 0) {
                setIsMuted(true);
                triggerMutedIcon();
            } else {
                setIsMuted(false);
            }
            if (videoRef.current) {
                videoRef.current.volume = newVolume;
            }
        },
        [videoRef, setVolume, setIsMuted, triggerMutedIcon]
    );

    return {
        handlePlayPause,
        handleSeek,
        handleMuteToggle,
        handleVolumeChange,
        showPlayPauseIcon,
        showMutedIcon,
    };
}
