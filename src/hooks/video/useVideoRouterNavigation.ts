"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useVideoPlaylist } from "@/provider/video-playlist-provider";

interface UseVideoRouterNavigationProps {
    onVideoEnd?: () => void;
    autoPlayNext?: boolean;
}

export function useVideoRouterNavigation({ onVideoEnd }: UseVideoRouterNavigationProps = {}) {
    const router = useRouter();
    const { playlist, currentIndex, isFirstVideo, isLastVideo, currentVideo } = useVideoPlaylist();

    const navigateToVideo = useCallback(
        (targetIndex: number) => {
            if (targetIndex >= 0 && targetIndex < playlist.length) {
                const targetVideo = playlist[targetIndex];
                const newUrl = `/@${targetVideo.user.username}/video/${targetVideo.post._id}`;
                router.replace(newUrl);
            }
        },
        [playlist, router]
    );

    const navigateToVideoById = useCallback(
        (videoId: string) => {
            const targetVideo = playlist.find((item) => item.post._id === videoId);
            if (targetVideo) {
                const newUrl = `/@${targetVideo.user.username}/video/${targetVideo.post._id}`;
                router.replace(newUrl);
            }
        },
        [playlist, router]
    );

    const handleVideoEnd = useCallback(() => {
        onVideoEnd?.();
    }, [onVideoEnd]);

    const handleNext = useCallback(() => {
        if (!isLastVideo) {
            navigateToVideo(currentIndex + 1);
        }
    }, [isLastVideo, currentIndex, navigateToVideo]);

    const handlePrevious = useCallback(() => {
        if (!isFirstVideo) {
            navigateToVideo(currentIndex - 1);
        }
    }, [isFirstVideo, currentIndex, navigateToVideo]);

    return {
        currentIndex,
        currentVideo,
        isFirstVideo,
        isLastVideo,
        handleNext,
        handlePrevious,
        handleVideoEnd,
        navigateToVideo,
        navigateToVideoById,
        canGoNext: !isLastVideo,
        canGoPrevious: !isFirstVideo,
    };
}
