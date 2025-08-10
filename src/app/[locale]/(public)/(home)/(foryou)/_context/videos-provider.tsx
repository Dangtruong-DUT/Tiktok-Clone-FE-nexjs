"use client";
import { postList as postListMock } from "@/mock/mockUserAndVideos";
import useScrollIndexObserver, { ScrollType } from "@/hooks/ui/useScrollIndexObserver";
import { useRouter } from "@/i18n/navigation";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { UserType } from "@/types/schemas/User.schema";
import { usePathname } from "next/navigation";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/redux";

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
    const openModalVideoDetailType = useAppSelector((state) => state.modal.typeOpenModal);
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

    const router = useRouter();
    const pathname = usePathname();

    const handleUpdateNewPathForVideo = useCallback(() => {
        const currentPost = postList[currentIndex];
        if (!currentPost) return;
        const newUrl = `/@${currentPost.user.username}/video/${currentPost.post._id}`;
        if (pathname.includes("video")) {
            router.replace(newUrl);
        } else {
            router.push(newUrl);
        }
    }, [currentIndex, postList, router, pathname]);

    useEffect(() => {
        if (openModalVideoDetailType === "commentsVideoDetail") {
            handleUpdateNewPathForVideo();
        } else if (pathname.includes("video") && openModalVideoDetailType === null) {
            handleUpdateNewPathForVideo();
        }
    }, [openModalVideoDetailType, pathname, handleUpdateNewPathForVideo]);

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
