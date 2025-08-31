"use client";

import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { useInViewport } from "@/hooks/ui/useInViewport";
import { useEffect, useRef } from "react";
import LoadingIcon from "@/components/lottie-icons/loading";
import CardVideoItem from "@/components/card-video-item-v2";

interface UnfollowedFeedProps {
    posts: TikTokPostType[];
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isLoading: boolean;
    isFetching: boolean;
}

export default function UnfollowedFeed({ posts, fetchNextPage, hasNextPage, isFetching }: UnfollowedFeedProps) {
    const sentinelScrollRef = useRef<HTMLDivElement>(null);
    const isInView = useInViewport(sentinelScrollRef);

    useEffect(() => {
        if (isInView && hasNextPage) {
            fetchNextPage();
        }
    }, [isInView, fetchNextPage, hasNextPage]);

    return (
        <>
            <div className="mx-auto p-4 max-w-184  overflow-y-auto   scrollbar-hidden grid  gap-6 grid-cols-[repeat(auto-fill,minmax(226px,1fr))] w-full  md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
                {posts.map((post) => (
                    <CardVideoItem key={post._id} post={post} />
                ))}
                {isFetching && (
                    <div className="px-4 py-4  col-span-full">
                        <LoadingIcon className="size-15 mx-auto" loop />
                    </div>
                )}
            </div>
            {/* Sentinel để lắng nghe*/}
            <div className="h-px bg-transparent" ref={sentinelScrollRef} />
        </>
    );
}
