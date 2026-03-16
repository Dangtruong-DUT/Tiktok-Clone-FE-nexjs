"use client";
import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useAppSelector } from "@/hooks/redux";
import useScrollIndexObserver from "@/hooks/ui/useScrollIndexObserver";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";

export const keyDataScroll = "data-scroll-index";

export function useHandleVideos(postList: TikTokPostType[]) {
    const { currentIndex, handleScrollToIndex } = useScrollIndexObserver({
        keyDataScroll,
        initialIndex: 0,
        listLength: postList.length,
    });

    const router = useRouter();
    const pathname = usePathname();
    const openModalVideoDetailType = useAppSelector((state) => state.modal.typeOpenModal);

    const handleUpdateNewPathForVideo = useCallback(() => {
        const currentPost = postList[currentIndex];
        if (!currentPost) return;
        const newUrl = `/@${currentPost.author.username}/video/${currentPost._id}`;
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

    return { currentIndex, handleScrollToIndex };
}
