'use client'
import { ScrollType } from '@/hooks/ui/useScrollIndexObserver'
import { TikTokPostType } from '@/types/models/post.model'
import React, { createContext, useMemo } from 'react'
import { useGetListPostInfiniteQuery } from '@/store/services/posts.service'
import { useHandleVideos } from '@/app/[locale]/(public)/(home)/(foryou)/_hooks/useHandleVideos'
import {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
    InfiniteQueryActionCreatorResult,
    InfiniteQueryDefinition
} from '@reduxjs/toolkit/query'
import { GetListPostRes } from '@/types/dtos/post/post-response.dto'

interface VideosProviderContextProps {
    currentIndex: number
    postList: TikTokPostType[]
    handleScrollToIndex: (type: ScrollType) => void
    fetchNextPage: () => InfiniteQueryActionCreatorResult<
        InfiniteQueryDefinition<
            'friend' | 'foryou',
            string | null,
            BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
            'Posts',
            GetListPostRes,
            'postApi',
            unknown
        >
    >
    postLength: number
    isLoading: boolean
    isFetching: boolean
    hasNextPage: boolean
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
    const { fetchNextPage, isLoading, isFetching, data, hasNextPage } = useGetListPostInfiniteQuery('foryou')

    const postList: TikTokPostType[] = useMemo(() => data?.pages.flatMap((page) => page.data) || [], [data])

    const handleVideoObj = useHandleVideos(postList)

    return (
        <VideosProviderContext
            value={{
                postList,
                fetchNextPage,
                isLoading,
                isFetching,
                postLength: postList.length,
                hasNextPage,
                ...handleVideoObj
            }}
        >
            {children}
        </VideosProviderContext>
    )
}
