"use client";
import { ScrollType } from "@/hooks/ui/useScrollIndexObserver";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import React, { createContext, useMemo } from "react";
import { useGetListPostInfiniteQuery, useGetUnfollowedPostsInfiniteQuery } from "@/services/RTK/posts.services";
import { useHandleVideos } from "@/app/[locale]/(public)/(home)/following/_hooks/useHandleVideos";
import { useAppSelector } from "@/hooks/redux";

interface FeedState {
    postList: TikTokPostType[];
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isLoading?: boolean;
    isFetching?: boolean;
}

interface VideosProviderContextProps {
    feeds: {
        friend: FeedState;
        unfollowed: FeedState;
    };
    currentIndex: number;
    handleScrollToIndex: (type: ScrollType) => void;
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
    const role = useAppSelector((state) => state.auth.role);
    const {
        fetchNextPage: fetchNextPageFriend,
        isLoading: isLoadingFriend,
        isFetching: isFetchingFriend,
        data: dataFriend,
        hasNextPage: hasNextPageFriend,
    } = useGetListPostInfiniteQuery("friend", { skip: role == null });
    const postList: TikTokPostType[] = useMemo(
        () => dataFriend?.pages.flatMap((page) => page.data.posts) || [],
        [dataFriend]
    );

    const {
        data: dataUnfollowed,
        fetchNextPage: fetchNextPageUnfollowed,
        hasNextPage: hasNextPageUnfollowed,
        isLoading: isLoadingUnfollowed,
        isFetching: isFetchingUnfollowed,
    } = useGetUnfollowedPostsInfiniteQuery(undefined, {
        skip: postList.length > 0,
    });

    const postListUnfollowed: TikTokPostType[] = useMemo(
        () => dataUnfollowed?.pages.flatMap((page) => page.data.posts) || [],
        [dataUnfollowed]
    );

    const handleVideoObj = useHandleVideos(postList);

    const feeds = {
        friend: {
            postList,
            fetchNextPage: fetchNextPageFriend,
            hasNextPage: hasNextPageFriend,
            isLoading: isLoadingFriend,
            isFetching: isFetchingFriend,
        },
        unfollowed: {
            postList: postListUnfollowed,
            fetchNextPage: fetchNextPageUnfollowed,
            hasNextPage: hasNextPageUnfollowed,
            isLoading: isLoadingUnfollowed,
            isFetching: isFetchingUnfollowed,
        },
    } satisfies Record<string, FeedState>;

    return (
        <VideosProviderContext
            value={{
                feeds,
                currentIndex: handleVideoObj.currentIndex,
                handleScrollToIndex: handleVideoObj.handleScrollToIndex,
            }}
        >
            {children}
        </VideosProviderContext>
    );
}
