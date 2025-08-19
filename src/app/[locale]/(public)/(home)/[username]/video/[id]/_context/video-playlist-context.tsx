"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { useGetListPostInfiniteQuery } from "@/services/RTK/posts.services";
import {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
    InfiniteQueryActionCreatorResult,
    InfiniteQueryDefinition,
} from "@reduxjs/toolkit/query";
import { GetListPostRes } from "@/types/response/post.type";

interface VideoPlaylistContextType {
    playlist: TikTokPostType[];
    currentIndex: number;
    currentVideo: TikTokPostType | null;
    isFirstVideo: boolean;
    isLastVideo: boolean;
    nextVideo: () => void;
    previousVideo: () => void;
    playVideoById: (videoId: string) => void;
    isLoading: boolean;
    isFetching: boolean;
    fetchNextPage: () => InfiniteQueryActionCreatorResult<
        InfiniteQueryDefinition<
            "friend" | "foryou",
            number,
            BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
            "Posts",
            GetListPostRes,
            "postApi",
            unknown
        >
    >;
    postLength: number;
    hasNextPage: boolean;
}

const VideoPlaylistContext = createContext<VideoPlaylistContextType | undefined>(undefined);

interface VideoPlaylistProviderProps {
    children: ReactNode;
    video: TikTokPostType;
}

export function VideoPlaylistProvider({ children, video }: VideoPlaylistProviderProps) {
    const [playlist, setPlaylistState] = useState<TikTokPostType[]>([video]);
    const { fetchNextPage, isLoading, isFetching, data, hasNextPage } = useGetListPostInfiniteQuery("foryou");
    const postList: TikTokPostType[] = React.useMemo(
        () => data?.pages.flatMap((page) => page.data.posts) || [],
        [data]
    );

    useEffect(() => {
        if (postList.length > 0) {
            setPlaylistState([video, ...postList.filter((post) => post._id !== video._id)]);
        }
    }, [postList, video]);

    const [currentIndex, setCurrentIndexState] = useState<number>(0);

    const currentVideo = playlist[currentIndex] || video;
    const isFirstVideo = currentIndex === 0;
    const isLastVideo = currentIndex === playlist.length - 1;
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
            setCurrentIndexState(-1);
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
            if (index >= 0) {
                setCurrentIndex(index);
            }
        },
        [playlist, setCurrentIndex]
    );

    return (
        <VideoPlaylistContext.Provider
            value={{
                playlist,
                currentIndex,
                currentVideo,
                isFirstVideo,
                isLastVideo,
                nextVideo,
                previousVideo,
                playVideoById,
                isLoading,
                isFetching,
                fetchNextPage,
                postLength: playlist.length || 0,
                hasNextPage,
            }}
        >
            {children}
        </VideoPlaylistContext.Provider>
    );
}

export function useVideoPlaylist() {
    const context = useContext(VideoPlaylistContext);
    if (context === undefined) {
        throw new Error("useVideoPlaylist must be used within a VideoPlaylistProvider");
    }
    return context;
}
