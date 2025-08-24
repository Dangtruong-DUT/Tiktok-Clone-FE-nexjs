"use client";

import ActionBar from "@/app/[locale]/(public)/(home)/(foryou)/_components/action-video-bar";
import NavigationVideo from "@/app/[locale]/(public)/(home)/(foryou)/_components/navigation-video";
import { useVideosProvider } from "@/app/[locale]/(public)/(home)/(foryou)/_context/videos-provider";
import VideoPlayer from "@/components/video-player";
import { useInViewport } from "@/hooks/ui/useInViewport";
import { useEffect, useRef } from "react";
import LoadingIcon from "@/components/lottie-icons/loading";
import { keyDataScroll } from "@/app/[locale]/(public)/(home)/(foryou)/hooks/useHandleVideos";

export default function VideoScrollWrapper() {
    const { postList, fetchNextPage, isFetching } = useVideosProvider();
    const sentinelScrollRef = useRef<HTMLDivElement>(null);
    const isInView = useInViewport(sentinelScrollRef);

    useEffect(() => {
        if (isInView) {
            fetchNextPage();
        }
    }, [isInView, fetchNextPage]);

    return (
        <>
            <div className=" max-h-screen w-full  overflow-y-auto  snap-y snap-mandatory scrollbar-hidden @container">
                {postList.map((post, index) => (
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
                {/* Sentinel để lắng nghe*/}
                <div className="h-px bg-transparent" ref={sentinelScrollRef} />
                {isFetching && (
                    <div className="px-4 @5xl:ps-[3rem] @5xl:pe-[15rem]  py-4  snap-start snap-always ">
                        <LoadingIcon className="size-15 mx-auto" loop />
                    </div>
                )}
            </div>
            <NavigationVideo className="me-4" />
        </>
    );
}
