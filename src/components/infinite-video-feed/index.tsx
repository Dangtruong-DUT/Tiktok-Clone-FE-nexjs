"use client";

import { keyDataScroll } from "@/app/[locale]/(public)/(home)/following/_hooks/useHandleVideos";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import VideoPlayer from "@/components/video-player";
import { useInViewport } from "@/hooks/ui/useInViewport";
import { useEffect, useRef } from "react";
import LoadingIcon from "@/components/lottie-icons/loading";
import ActionBar from "@/components/action-video-bar-v1";
import VideoWithActionSkeleton from "@/components/infinite-video-feed/video-skeleton";
import NavigationVideoSkeleton from "@/components/infinite-video-feed/navigation-video-skeleton";

interface InfiniteVideoFeedProps {
    posts: TikTokPostType[];
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isLoading: boolean;
    isFetching: boolean;
    NavigationVideo: React.ComponentType<{ className?: string }>;
}

export default function InfiniteVideoFeed({
    posts,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    NavigationVideo,
}: InfiniteVideoFeedProps) {
    const sentinelScrollRef = useRef<HTMLDivElement>(null);
    const isInView = useInViewport(sentinelScrollRef);

    useEffect(() => {
        if (isInView && hasNextPage) {
            fetchNextPage();
        }
    }, [isInView, fetchNextPage, hasNextPage]);

    return (
        <>
            <div className=" max-h-screen w-full  overflow-y-auto  snap-y snap-mandatory scrollbar-hidden @container">
                {isLoading && <VideoWithActionSkeleton className="snap-start snap-always" />}
                {!isLoading &&
                    posts.map((post, index) => (
                        <article
                            key={String(post._id + index)}
                            {...{ [keyDataScroll]: index }}
                            className="px-4 @5xl:ps-[3rem] @5xl:pe-[15rem]  py-4 min-h-screen snap-start snap-always transition-transform duration-400"
                        >
                            <div className="flex flex-row items-end justify-center space-x-4 mx-auto">
                                <VideoPlayer post={post} className="sm:max-w-[400px]" />
                                <ActionBar post={post} className="mt-4" />
                            </div>
                        </article>
                    ))}
                {/* Sentinel để lắng nghe*/}
                <div className="h-px bg-transparent" ref={sentinelScrollRef} />
                {!isLoading && isFetching && (
                    <div className="px-4 @5xl:ps-[3rem] @5xl:pe-[15rem]  py-4  snap-start snap-always ">
                        <LoadingIcon className="size-15 mx-auto" loop />
                    </div>
                )}
            </div>
            {!isLoading && <NavigationVideo className="me-4" />}
            {isLoading && <NavigationVideoSkeleton className="me-4" />}
        </>
    );
}
