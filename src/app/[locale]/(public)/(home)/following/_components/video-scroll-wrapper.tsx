"use client";

import VideoPlayer from "@/components/video-player";
import { useInViewport } from "@/hooks/ui/useInViewport";
import { useEffect, useRef } from "react";
import LoadingIcon from "@/components/lottie-icons/loading";
import ActionBar from "@/components/action-video-bar-v1";
import { useVideosProvider } from "@/app/[locale]/(public)/(home)/following/_context/videos-provider";
import NavigationVideo from "@/app/[locale]/(public)/(home)/following/_components/navigation-video";
import { keyDataScroll } from "@/app/[locale]/(public)/(home)/following/_hooks/useHandleVideos";
import CardVideoItem from "@/components/card-video-item-v2";

export default function VideoScrollWrapper() {
    const { feeds } = useVideosProvider();
    const sentinelScrollRef = useRef<HTMLDivElement>(null);
    const isInView = useInViewport(sentinelScrollRef);

    useEffect(() => {
        if (isInView && feeds.friend.hasNextPage) {
            feeds.friend.fetchNextPage();
        }
    }, [isInView, feeds.friend, feeds.friend.fetchNextPage, feeds.friend.hasNextPage]);

    useEffect(() => {
        if (isInView && feeds.unfollowed.hasNextPage) {
            feeds.unfollowed.fetchNextPage();
        }
    }, [isInView, feeds.unfollowed, feeds.unfollowed.fetchNextPage, feeds.unfollowed.hasNextPage]);

    const isFetching = feeds.friend.isFetching || feeds.unfollowed.isFetching;
    const isFriendViewMode = feeds.friend.postList.length > 0;

    return (
        <>
            {isFriendViewMode && (
                <>
                    <div className=" max-h-screen w-full  overflow-y-auto  snap-y snap-mandatory scrollbar-hidden @container">
                        {feeds.friend.postList.map((post, index) => (
                            <article
                                key={String(post._id + index)}
                                {...{ [keyDataScroll]: index }}
                                className="px-4 @5xl:ps-[3rem] @5xl:pe-[15rem]  py-4 min-h-screen snap-start snap-always "
                            >
                                <div className="flex flex-row items-end justify-center space-x-4 mx-auto">
                                    <VideoPlayer post={post} className="sm:max-w-[400px]" />
                                    <ActionBar post={post} className="mt-4" />
                                </div>
                            </article>
                        ))}

                        {isFetching && (
                            <div className="px-4 @5xl:ps-[3rem] @5xl:pe-[15rem]  py-4  snap-start snap-always ">
                                <LoadingIcon className="size-15 mx-auto" loop />
                            </div>
                        )}
                    </div>
                    <NavigationVideo className="me-4" />
                </>
            )}
            {!isFriendViewMode && (
                <div className="mx-auto p-4 max-w-184  overflow-y-auto   scrollbar-hidden grid  gap-6 grid-cols-[repeat(auto-fill,minmax(226px,1fr))] w-full  md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
                    {feeds.unfollowed.postList.map((post) => (
                        <CardVideoItem key={post._id} post={post} />
                    ))}
                    {isFetching && (
                        <div className="px-4 py-4  col-span-full">
                            <LoadingIcon className="size-15 mx-auto" loop />
                        </div>
                    )}
                </div>
            )}
            {/* Sentinel để lắng nghe*/}
            <div className="h-px bg-transparent" ref={sentinelScrollRef} />
        </>
    );
}
