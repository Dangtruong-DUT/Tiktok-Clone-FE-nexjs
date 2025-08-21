import { ID_TAB_ITEMS } from "@/app/[locale]/(public)/(home)/[username]/_config/tab-items.config";
import {
    useGetBookmarkedPostsOfUserInfiniteQuery,
    useGetLikedPostsOfUserInfiniteQuery,
    useGetPostOfUserInfiniteQuery,
} from "@/services/RTK/posts.services";
import { useMemo } from "react";

interface UsePostsTabQueryProps {
    activeTabId: ID_TAB_ITEMS;
    userId: string;
}

export default function usePostsTabQuery({ activeTabId, userId }: UsePostsTabQueryProps) {
    const videosQuery = useGetPostOfUserInfiniteQuery(userId, {
        skip: activeTabId !== "videos",
        refetchOnMountOrArgChange: false,
    });
    const bookmarkedQuery = useGetBookmarkedPostsOfUserInfiniteQuery(userId, {
        skip: activeTabId !== "favorites",
        refetchOnMountOrArgChange: false,
    });
    const likedQuery = useGetLikedPostsOfUserInfiniteQuery(userId, {
        skip: activeTabId !== "liked",
        refetchOnMountOrArgChange: false,
    });

    const postList = useMemo(() => {
        switch (activeTabId) {
            case "videos":
                return videosQuery.data?.pages.flatMap((page) => page.data.posts) || [];
            case "favorites":
                return bookmarkedQuery.data?.pages.flatMap((page) => page.data.posts) || [];
            case "liked":
                return likedQuery.data?.pages.flatMap((page) => page.data.posts) || [];
            default:
                return [];
        }
    }, [activeTabId, videosQuery.data, bookmarkedQuery.data, likedQuery.data]);

    const getCurrentQuery = () => {
        switch (activeTabId) {
            case "videos":
                return videosQuery;
            case "favorites":
                return bookmarkedQuery;
            case "liked":
                return likedQuery;
            default:
                return { hasNextPage: false, fetchNextPage: () => {}, isFetching: false };
        }
    };

    const currentQuery = getCurrentQuery();

    return {
        postList,
        hasNextPage: currentQuery.hasNextPage,
        fetchNextPage: currentQuery.fetchNextPage,
        isFetching: currentQuery.isFetching,
    };
}
