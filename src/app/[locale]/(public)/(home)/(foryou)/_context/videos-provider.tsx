"use client";

import { postList as postListMock } from "@/app/[locale]/(public)/(home)/(foryou)/mock";
import useScrollIndexObserver, { ScrollType } from "@/hooks/ui/useScrollIndexObserver";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { UserType } from "@/types/schemas/User.schema";
import React from "react";

interface VideosProviderContextProps {
    currentIndex: number;
    postLength: number;
    postList: { post: TikTokPostType; user: UserType }[];
    handleScrollToIndex: (type: ScrollType) => void;
}

const VideosProviderContext = React.createContext<VideosProviderContextProps | undefined>(undefined);

export function useVideosProvider() {
    const context = React.useContext(VideosProviderContext);
    if (!context) {
        throw new Error("useVideosProvider must be used within a VideosProvider");
    }
    return context;
}

export const keyDataScroll = "data-scroll-index";

export function VideosProvider({ children }: { children: React.ReactNode }) {
    const { currentIndex, handleScrollToIndex } = useScrollIndexObserver({
        keyDataScroll,
        initialIndex: 0,
        listLength: postListMock.length,
    });
    const postList: { post: TikTokPostType; user: UserType }[] = postListMock;

    return (
        <VideosProviderContext value={{ currentIndex, postList, handleScrollToIndex, postLength: postList.length }}>
            {children}
        </VideosProviderContext>
    );
}
