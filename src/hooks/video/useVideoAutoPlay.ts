"use client";

import { useEffect } from "react";
import { useInViewport } from "@/hooks/ui/useInViewport";

interface UseVideoAutoPlayProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    threshold?: number;
}

export function useVideoAutoPlay({ videoRef, threshold = 0.5 }: UseVideoAutoPlayProps) {
    const isInViewport = useInViewport(videoRef, threshold);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isInViewport) {
            video.play().catch((error) => {
                console.error("Error attempting to play video:", error);
            });
        } else {
            video.pause();
        }
    }, [isInViewport, videoRef]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                video.pause();
            } else {
                if (isInViewport) {
                    video.play().catch((error) => {
                        console.error("Error attempting to play video:", error);
                    });
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [isInViewport, videoRef]);

    return { isInViewport };
}
