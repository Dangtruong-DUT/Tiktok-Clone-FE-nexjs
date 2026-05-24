'use client'

import { useVideosProvider } from '@/app/[locale]/(public)/(home)/following/_context/videos-provider'
import NavigationVideo from '@/app/[locale]/(public)/(home)/following/_components/navigation-video'
import InfiniteVideoFeed from '@/components/infinite-video-feed'
import UnfollowedFeed from '@/app/[locale]/(public)/(home)/following/_components/unfollowed-feed'
import { useAppContext } from '@/provider/app-provider'
import { AuthStatus } from '@/constants/status/async'
export default function VideoScrollWrapper() {
    const { authStatus } = useAppContext()

    const { feeds } = useVideosProvider()
    const isFollowingViewMode = feeds.following.postList.length > 0 || feeds.following.isLoading

    return (
        <>
            {isFollowingViewMode && authStatus === AuthStatus.READY && (
                <InfiniteVideoFeed
                    posts={feeds.following.postList}
                    fetchNextPage={feeds.following.fetchNextPage}
                    hasNextPage={feeds.following.hasNextPage}
                    isLoading={feeds.following.isLoading ?? true}
                    isFetching={feeds.following.isFetching ?? true}
                    NavigationVideo={NavigationVideo}
                />
            )}
            {!isFollowingViewMode && (
                <UnfollowedFeed
                    posts={feeds.unfollowed.postList}
                    fetchNextPage={feeds.unfollowed.fetchNextPage}
                    hasNextPage={feeds.unfollowed.hasNextPage}
                    isLoading={feeds.unfollowed.isLoading ?? true}
                    isFetching={feeds.unfollowed.isFetching ?? true}
                />
            )}
        </>
    )
}
