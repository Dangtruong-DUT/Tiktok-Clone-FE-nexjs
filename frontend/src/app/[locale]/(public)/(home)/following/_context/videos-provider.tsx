'use client'
import { ScrollType } from '@/hooks/ui/useScrollIndexObserver'
import { TikTokPostType } from '@/types/models/post.model'
import React, { createContext, useMemo } from 'react'
import { useGetFollowingPostsInfiniteQuery, useGetUnfollowedPostsInfiniteQuery } from '@/store/services/content/posts.service'
import { useHandleVideos } from '@/app/[locale]/(public)/(home)/following/_hooks/useHandleVideos'
import { useAppSelector } from '@/store/hooks'

interface FeedState {
    postList: TikTokPostType[]
    fetchNextPage: () => void
    hasNextPage: boolean
    isLoading?: boolean
    isFetching?: boolean
}

interface VideosProviderContextProps {
    feeds: {
        following: FeedState
        unfollowed: FeedState
    }
    currentIndex: number
    handleScrollToIndex: (type: ScrollType) => void
}

const VideosProviderContext = createContext<VideosProviderContextProps | undefined>(undefined)

export function useVideosProvider() {
    const context = React.useContext(VideosProviderContext)
    if (!context) {
        throw new Error('useVideosProvider must be used within a VideosProvider')
    }
    return context
}

export function VideosProvider({ children }: { children: React.ReactNode }) {
    const role = useAppSelector((state) => state.auth.role)
    const {
        fetchNextPage: fetchNextPageFollowing,
        isLoading: isLoadingFollowing,
        isFetching: isFetchingFollowing,
        data: dataFollowing,
        hasNextPage: hasNextPageFollowing
    } = useGetFollowingPostsInfiniteQuery(undefined, { skip: role == null })
    const postList: TikTokPostType[] = useMemo(
        () => dataFollowing?.pages.flatMap((page) => page.data) || [],
        [dataFollowing]
    )

    const {
        data: dataUnfollowed,
        fetchNextPage: fetchNextPageUnfollowed,
        hasNextPage: hasNextPageUnfollowed,
        isLoading: isLoadingUnfollowed,
        isFetching: isFetchingUnfollowed
    } = useGetUnfollowedPostsInfiniteQuery(undefined, {
        skip: postList.length > 0
    })

    const postListUnfollowed: TikTokPostType[] = useMemo(
        () => dataUnfollowed?.pages.flatMap((page) => page.data) || [],
        [dataUnfollowed]
    )

    const handleVideoObj = useHandleVideos(postList)

    const feeds = {
        following: {
            postList,
            fetchNextPage: fetchNextPageFollowing,
            hasNextPage: hasNextPageFollowing,
            isLoading: isLoadingFollowing,
            isFetching: isFetchingFollowing
        },
        unfollowed: {
            postList: postListUnfollowed,
            fetchNextPage: fetchNextPageUnfollowed,
            hasNextPage: hasNextPageUnfollowed,
            isLoading: isLoadingUnfollowed,
            isFetching: isFetchingUnfollowed
        }
    } satisfies Record<string, FeedState>

    return (
        <VideosProviderContext
            value={{
                feeds,
                currentIndex: handleVideoObj.currentIndex,
                handleScrollToIndex: handleVideoObj.handleScrollToIndex
            }}
        >
            {children}
        </VideosProviderContext>
    )
}
