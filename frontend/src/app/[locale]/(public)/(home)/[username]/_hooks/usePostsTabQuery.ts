import { ID_TAB_ITEMS } from '@/app/[locale]/(public)/(home)/[username]/_config/tab-items.config'
import { HTTP_STATUS } from '@/constants/api/http-status'
import {
    useGetBookmarkedPostsOfUserInfiniteQuery,
    useGetLikedPostsOfUserInfiniteQuery,
    useGetPostOfUserInfiniteQuery
} from '@/store/services/content/posts.service'
import { useMemo } from 'react'

interface UsePostsTabQueryProps {
    activeTabId: ID_TAB_ITEMS
    userId: string
}

export default function usePostsTabQuery({ activeTabId, userId }: UsePostsTabQueryProps) {
    const videosQuery = useGetPostOfUserInfiniteQuery(userId, {
        skip: activeTabId !== 'videos',
        refetchOnMountOrArgChange: false
    })
    const bookmarkedQuery = useGetBookmarkedPostsOfUserInfiniteQuery(userId, {
        skip: activeTabId !== 'favorites',
        refetchOnMountOrArgChange: false
    })
    const likedQuery = useGetLikedPostsOfUserInfiniteQuery(userId, {
        skip: activeTabId !== 'liked',
        refetchOnMountOrArgChange: false
    })

    const postList = useMemo(() => {
        switch (activeTabId) {
            case 'videos':
                return videosQuery.data?.pages.flatMap((page) => page.data) || []
            case 'favorites':
                return bookmarkedQuery.data?.pages.flatMap((page) => page.data) || []
            case 'liked':
                return likedQuery.data?.pages.flatMap((page) => page.data) || []
            default:
                return []
        }
    }, [activeTabId, videosQuery.data, bookmarkedQuery.data, likedQuery.data])

    const getCurrentQuery = () => {
        switch (activeTabId) {
            case 'videos':
                return videosQuery
            case 'favorites':
                return bookmarkedQuery
            case 'liked':
                return likedQuery
            default:
                return { hasNextPage: false, fetchNextPage: () => {}, isFetching: false, isLoading: false }
        }
    }

    const currentQuery = getCurrentQuery()

    const isPrivate = useMemo(() => {
        if (!('error' in currentQuery) || !currentQuery.error || !('status' in currentQuery.error)) return false
        return currentQuery.error.status === HTTP_STATUS.FORBIDDEN
    }, [currentQuery])

    return {
        postList,
        hasNextPage: currentQuery.hasNextPage,
        fetchNextPage: currentQuery.fetchNextPage,
        isFetching: currentQuery.isFetching,
        isLoading: currentQuery.isLoading,
        isPrivate
    }
}
