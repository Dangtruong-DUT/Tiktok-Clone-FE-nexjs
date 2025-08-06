"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { UserType } from "@/types/schemas/User.schema";

export interface VideoPlaylistItem {
    post: TikTokPostType;
    user: UserType;
}

interface VideoPlaylistContextType {
    playlist: VideoPlaylistItem[];
    currentIndex: number;
    currentVideo: VideoPlaylistItem | null;
    isFirstVideo: boolean;
    isLastVideo: boolean;
    setPlaylist: (playlist: VideoPlaylistItem[]) => void;
    nextVideo: () => void;
    previousVideo: () => void;
    playVideoById: (videoId: string) => void;
}

const VideoPlaylistContext = createContext<VideoPlaylistContextType | undefined>(undefined);

interface VideoPlaylistProviderProps {
    children: ReactNode;
    initialPlaylist?: VideoPlaylistItem[];
    initialIndex?: number;
}

export function VideoPlaylistProvider({
    children,
    initialPlaylist = [],
    initialIndex = 0,
}: VideoPlaylistProviderProps) {
    const [playlist, setPlaylistState] = useState<VideoPlaylistItem[]>(initialPlaylist);
    const [currentIndex, setCurrentIndexState] = useState<number>(initialIndex);

    const currentVideo = playlist[currentIndex] || null;
    const isFirstVideo = currentIndex === 0;
    const isLastVideo = currentIndex === playlist.length - 1;

    const setPlaylist = useCallback((newPlaylist: VideoPlaylistItem[]) => {
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
            const index = playlist.findIndex((item) => item.post._id === videoId);
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
