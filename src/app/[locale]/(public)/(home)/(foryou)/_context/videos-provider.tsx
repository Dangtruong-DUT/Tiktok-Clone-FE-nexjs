"use client";
import { ScrollType } from "@/hooks/ui/useScrollIndexObserver";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import React, { createContext, useMemo } from "react";
import { useGetListPostInfiniteQuery } from "@/services/RTK/posts.services";
import { useHandleVideos } from "@/app/[locale]/(public)/(home)/(foryou)/hooks/useHandleVideos";
import {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
    InfiniteQueryActionCreatorResult,
    InfiniteQueryDefinition,
} from "@reduxjs/toolkit/query";
import { GetListPostRes } from "@/types/response/post.type";

interface VideosProviderContextProps {
    currentIndex: number;
    postList: TikTokPostType[];
    handleScrollToIndex: (type: ScrollType) => void;
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
    isLoading: boolean;
    isFetching: boolean;
}

const VideosProviderContext = createContext<VideosProviderContextProps | undefined>(undefined);

export function useVideosProvider() {
    const context = React.useContext(VideosProviderContext);
    if (!context) {
        throw new Error("useVideosProvider must be used within a VideosProvider");
    }
    return context;
}

export function VideosProvider({ children }: { children: React.ReactNode }) {
    const { fetchNextPage, isLoading, isFetching, data } = useGetListPostInfiniteQuery("foryou");

    const postList: TikTokPostType[] = useMemo(() => data?.pages.flatMap((page) => page.data.posts) || [], [data]);

    const handleVideoObj = useHandleVideos(postList);

    return (
        <VideosProviderContext
            value={{
                postList,
                fetchNextPage,
                isLoading,
                isFetching,
                postLength: postList.length,
                ...handleVideoObj,
            }}
        >
            {children}
        </VideosProviderContext>
    );
}
