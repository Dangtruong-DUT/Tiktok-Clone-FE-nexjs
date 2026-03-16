"use client";

import NavigationVideo from "@/app/[locale]/(public)/(home)/(foryou)/_components/navigation-video";
import { useVideosProvider } from "@/app/[locale]/(public)/(home)/(foryou)/_context/videos-provider";
import { useAppContext } from "@/provider/app-provider";
import InfiniteVideoFeed from "@/components/infinite-video-feed";

export default function VideoScrollWrapper() {
    const { authStatus } = useAppContext();
    const { postList, fetchNextPage, isFetching, isLoading, hasNextPage } = useVideosProvider();

    const isAppLoading = authStatus === "loading" || isLoading;

    return (
        <InfiniteVideoFeed
            posts={postList}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isLoading={isAppLoading}
            isFetching={isFetching}
            NavigationVideo={NavigationVideo}
        />
    );
}
