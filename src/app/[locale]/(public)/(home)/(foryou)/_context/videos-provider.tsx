"use client";

import { postList as postListMock } from "@/app/[locale]/(public)/(home)/(foryou)/mock";
import useScrollIndexObserver, { ScrollType } from "@/hooks/ui/useScrollIndexObserver";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { UserType } from "@/types/schemas/User.schema";
import React, { createContext, useEffect, useState } from "react";

interface VideosProviderContextProps {
    currentIndex: number;
    postLength: number;
    postList: { post: TikTokPostType; user: UserType }[];
    handleScrollToIndex: (type: ScrollType) => void;
    visiblePostId: string | null;
}

const VideosProviderContext = createContext<VideosProviderContextProps | undefined>(undefined);

export function useVideosProvider() {
    const context = React.useContext(VideosProviderContext);
    if (!context) {
        throw new Error("useVideosProvider must be used within a VideosProvider");
    }
    return context;
}

export const keyDataScroll = "data-scroll-index";

export function VideosProvider({ children }: { children: React.ReactNode }) {
    const [visiblePostId, setVisiblePostId] = useState<string | null>(null);
    const [isOpenComment, setIsOpenComment] = useState<boolean>(false);
    const { currentIndex, handleScrollToIndex } = useScrollIndexObserver({
        keyDataScroll,
        initialIndex: 0,
        listLength: postListMock.length,
    });
    const postList: { post: TikTokPostType; user: UserType }[] = postListMock;

    useEffect(() => {
        const currentPost = postList[currentIndex];
        if (currentPost) {
            setVisiblePostId(currentPost.post._id);
        } else {
            setVisiblePostId(null);
        }
    }, [currentIndex, postList]);

    return (
        <VideosProviderContext
            value={{
                currentIndex,
                postList,
                handleScrollToIndex,
                postLength: postList.length,
                visiblePostId,
            }}
        >
            {children}
        </VideosProviderContext>
    );
}
