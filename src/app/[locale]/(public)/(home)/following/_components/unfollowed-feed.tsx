"use client";

import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { useInViewport } from "@/hooks/ui/useInViewport";
import { useEffect, useRef, useState } from "react";
import LoadingIcon from "@/components/lottie-icons/loading";
import CardVideoItem from "@/components/card-video-item-v2";
import { Skeleton } from "@/components/ui/skeleton";
import { CiGrid41 } from "react-icons/ci";
import { useTranslations } from "next-intl";

interface UnfollowedFeedProps {
    posts: TikTokPostType[];
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isLoading: boolean;
    isFetching: boolean;
}

export default function UnfollowedFeed({
    posts,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
}: UnfollowedFeedProps) {
    const t = useTranslations("HomePage.unfollowedFeed");
    const sentinelScrollRef = useRef<HTMLDivElement>(null);
    const isInView = useInViewport(sentinelScrollRef);
    const [showSkeleton, setShowSkeleton] = useState<boolean>(isLoading);

    useEffect(() => {
        if (isInView && hasNextPage) {
            fetchNextPage();
        }
    }, [isInView, fetchNextPage, hasNextPage]);

    useEffect(() => {
        if (!isLoading) {
            const timeout = setTimeout(() => setShowSkeleton(false), 200);
            return () => clearTimeout(timeout);
        } else {
            setShowSkeleton(true);
        }
    }, [isLoading]);

    return (
        <>
            <div className="mx-auto p-4 max-w-184  overflow-y-auto   scrollbar-hidden grid  gap-6 grid-cols-[repeat(auto-fill,minmax(226px,1fr))]  md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] w-full h-fit m-auto">
                {posts.length > 0 && posts.map((post) => <CardVideoItem post={post} className="" key={post._id} />)}

                {posts.length > 0 && isFetching && (
                    <div className="px-4 py-4 col-span-full w-full flex justify-center items-center">
                        <LoadingIcon className="size-15 mx-auto" loop />
                    </div>
                )}

                {posts.length === 0 &&
                    showSkeleton &&
                    Array.from({ length: 12 }).map((_, index) => (
                        <Skeleton key={index} className="w-full pt-[133.333%] aspect-[3/4]" />
                    ))}

                {posts.length === 0 && !showSkeleton && (
                    <div className="mx-auto flex col-span-full w-full flex-col justify-center items-center min-h-[490px]">
                        <div className="flex justify-center items-center size-[92px] rounded-full bg-muted">
                            <CiGrid41 size={44} />
                        </div>
                        <p className="text-2xl font-bold mt-6">{t("noContent")}</p>
                    </div>
                )}
            </div>
            {/* Sentinel để lắng nghe*/}
            <div className="h-px bg-transparent" ref={sentinelScrollRef} />
        </>
    );
}
