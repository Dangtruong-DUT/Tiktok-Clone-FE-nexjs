"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";

interface VideoPlaylistContextType {
    playlist: TikTokPostType[];
    currentIndex: number;
    currentVideo: TikTokPostType | null;
    isFirstVideo: boolean;
    isLastVideo: boolean;
    setPlaylist: (playlist: TikTokPostType[]) => void;
    nextVideo: () => void;
    previousVideo: () => void;
    playVideoById: (videoId: string) => void;
}

const VideoPlaylistContext = createContext<VideoPlaylistContextType | undefined>(undefined);

interface VideoPlaylistProviderProps {
    children: ReactNode;
    video: TikTokPostType;
}

export function VideoPlaylistProvider({ children, video }: VideoPlaylistProviderProps) {
    const [playlist, setPlaylistState] = useState<TikTokPostType[]>([video]);
    const [currentIndex, setCurrentIndexState] = useState<number>(0);

    const currentVideo = playlist[currentIndex] || null;
    const isFirstVideo = currentIndex === 0;
    const isLastVideo = currentIndex === playlist.length - 1;

    const setPlaylist = useCallback((newPlaylist: TikTokPostType[]) => {
        setPlaylistState(newPlaylist);
        setCurrentIndexState(0);
    }, []);

    const setCurrentIndex = useCallback(
        (index: number) => {
            if (index >= 0 && index < playlist.length) {
                setCurrentIndexState(index);
            }
        },
        [playlist.length]
    );

    const nextVideo = useCallback(() => {
        if (!isLastVideo) {
            setCurrentIndexState((prev) => prev + 1);
        } else {
            setCurrentIndexState(0);
        }
    }, [isLastVideo]);

    const previousVideo = useCallback(() => {
        if (!isFirstVideo) {
            setCurrentIndexState((prev) => prev - 1);
        }
    }, [isFirstVideo]);

    const playVideoById = useCallback(
        (videoId: string) => {
            const index = playlist.findIndex((item) => item._id === videoId);
            if (index !== -1) {
                setCurrentIndex(index);
            }
        },
        [playlist, setCurrentIndex]
    );

    const value: VideoPlaylistContextType = {
        playlist,
        currentIndex,
        currentVideo,
        isFirstVideo,
        isLastVideo,
        setPlaylist,
        nextVideo,
        previousVideo,
        playVideoById,
    };

    return <VideoPlaylistContext.Provider value={value}>{children}</VideoPlaylistContext.Provider>;
}

export function useVideoPlaylist() {
    const context = useContext(VideoPlaylistContext);
    if (context === undefined) {
        throw new Error("useVideoPlaylist must be used within a VideoPlaylistProvider");
    }
    return context;
}
