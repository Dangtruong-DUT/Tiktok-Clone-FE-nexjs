"use client";

import { ID_TAB_ITEMS } from "@/app/[locale]/(public)/(home)/[username]/_config/tab-items.config";
import usePostsTabQuery from "@/app/[locale]/(public)/(home)/[username]/_hooks/usePostsTabQuery";
import { GetListPostRes } from "@/types/response/post.type";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
    InfiniteQueryActionCreatorResult,
    InfiniteQueryDefinition,
} from "@reduxjs/toolkit/query";
import { createContext, use, useState } from "react";

type VideoContainerContextType = {
    activeTabId: ID_TAB_ITEMS;
    setActiveTabId: (tabId: ID_TAB_ITEMS) => void;
    hasNextPage: boolean;
    fetchNextPage:
        | (() => void)
        | (() => InfiniteQueryActionCreatorResult<
              InfiniteQueryDefinition<
                  string,
                  number,
                  BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
                  "Posts",
                  GetListPostRes,
                  "postApi",
                  unknown
              >
          >);
    postList: TikTokPostType[];
    isFetching: boolean;
};
const videosContext = createContext<VideoContainerContextType>({
    activeTabId: "videos",
    setActiveTabId: () => {},
    hasNextPage: false,
    fetchNextPage: () => Promise.resolve(),
    postList: [],
    isFetching: false,
});

interface VideoContainerProps {
    children: React.ReactNode;
    userId: string;
}

export default function VideosProvider({ children, userId }: VideoContainerProps) {
    const [activeTabId, setActiveTabId] = useState<ID_TAB_ITEMS>("videos");
    const { postList, hasNextPage, fetchNextPage, isFetching } = usePostsTabQuery({ activeTabId, userId });

    return (
        <videosContext.Provider
            value={{ activeTabId, setActiveTabId, hasNextPage, fetchNextPage, postList, isFetching }}
        >
            {children}
        </videosContext.Provider>
    );
}

export const useVideosContext = () => {
    const context = use(videosContext);
    if (!context) throw new Error("useVideosContext must be used within a VideosProvider");
    return context;
};
