"use client";

import { useVideosProvider } from "@/app/[locale]/(public)/(home)/following/_context/videos-provider";
import NavigationVideo from "@/app/[locale]/(public)/(home)/following/_components/navigation-video";
import InfiniteVideoFeed from "@/components/infinite-video-feed";
import UnfollowedFeed from "@/app/[locale]/(public)/(home)/following/_components/unfollowed-feed";
import { useAppContext } from "@/provider/app-provider";

export default function VideoScrollWrapper() {
    const { authStatus } = useAppContext();

    const { feeds } = useVideosProvider();
    const isFriendViewMode = feeds.friend.postList.length > 0 || feeds.friend.isLoading || authStatus === "loading";

    return (
        <>
            {isFriendViewMode && (
                <InfiniteVideoFeed
                    posts={feeds.friend.postList}
                    fetchNextPage={feeds.friend.fetchNextPage}
                    hasNextPage={feeds.friend.hasNextPage}
                    isLoading={feeds.friend.isLoading || authStatus === "loading"}
                    isFetching={feeds.friend.isFetching ?? true}
                    NavigationVideo={NavigationVideo}
                />
            )}
            {!isFriendViewMode && (
                <UnfollowedFeed
                    posts={feeds.unfollowed.postList}
                    fetchNextPage={feeds.unfollowed.fetchNextPage}
                    hasNextPage={feeds.unfollowed.hasNextPage}
                    isLoading={feeds.unfollowed.isLoading ?? true}
                    isFetching={feeds.unfollowed.isFetching ?? true}
                />
            )}
        </>
    );
}
