"use client";

import ActionBar from "@/app/[locale]/(public)/(home)/(foryou)/_components/action-video-bar";
import NavigationVideo from "@/app/[locale]/(public)/(home)/(foryou)/_components/navigation-video";
import { keyDataScroll, useVideosProvider } from "@/app/[locale]/(public)/(home)/(foryou)/_context/videos-provider";
import VideoPlayer from "@/components/video-player";

export default function VideoScrollWrapper() {
    const { postList } = useVideosProvider();
    return (
        <>
            <div className=" max-h-screen w-full  overflow-y-auto  snap-y snap-mandatory scrollbar-hidden @container">
                {postList.map((item, index) => (
                    <article
                        key={String(item.post._id + index)}
                        {...{ [keyDataScroll]: index }}
                        className="px-4 @5xl:ps-[3rem] @5xl:pe-[15rem]  py-4 min-h-screen snap-start snap-always "
                    >
                        <div className="flex flex-row items-end justify-center space-x-4 mx-auto">
                            <VideoPlayer post={item.post} author={item.user} className="sm:max-w-[400px]" />
                            <ActionBar post={item.post} author={item.user} className="mt-4" />
                        </div>
                    </article>
                ))}
            </div>
            <NavigationVideo className="pe-3" />
        </>
    );
}
