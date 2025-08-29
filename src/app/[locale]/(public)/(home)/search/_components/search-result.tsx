"use client";

import Header from "@/app/[locale]/(public)/(home)/search/_components/tabbar-header";
import { TabbarItemsId } from "@/app/[locale]/(public)/(home)/search/_config/tabbar-items";
import { SearchParamsLoader, useSearchParamsLoader } from "@/components/searchparams-loader";
import { useSearchPostsInfiniteQuery, useSearchUsersInfiniteQuery } from "@/services/RTK/search.services";
import { useState } from "react";
import UsersContainer from "@/app/[locale]/(public)/(home)/search/_components/users-container";
import PostsContainer from "@/app/[locale]/(public)/(home)/search/_components/posts-container";

export default function SearchResults() {
    const [tabActive, setTabActive] = useState<TabbarItemsId>("USERS");
    const { setSearchParams, searchParams } = useSearchParamsLoader();
    const query = searchParams?.get("q") || "";
    const {
        fetchNextPage: handleFetchNextPageUsers,
        hasNextPage: hasNextPageUsers,
        data: dataUsers,
        isFetching: isFetchingUsers,
    } = useSearchUsersInfiniteQuery({ q: query }, { skip: tabActive !== "USERS" || !query });

    const {
        fetchNextPage: handleFetchNextPagePosts,
        hasNextPage: hasNextPagePosts,
        data: dataPosts,
        isFetching: isFetchingPosts,
    } = useSearchPostsInfiniteQuery({ q: query }, { skip: tabActive !== "VIDEOS" || !query });

    const userDataResults = dataUsers?.pages.flatMap((page) => page.data) || [];
    const postDataResults = dataPosts?.pages.flatMap((page) => page.data) || [];

    return (
        <div className="p-4 mx-auto max-w-[800px] w-[73%] min-w-[420px]">
            <SearchParamsLoader onParamsReceived={setSearchParams} />
            <Header tabActive={tabActive} setTabActive={setTabActive} />
            <div>
                {tabActive === "USERS" && dataUsers && (
                    <UsersContainer
                        fetchNextPage={handleFetchNextPageUsers}
                        hasNextPage={hasNextPageUsers}
                        data={userDataResults}
                        isFetching={isFetchingUsers}
                    />
                )}
                {tabActive === "VIDEOS" && dataPosts && (
                    <PostsContainer
                        fetchNextPage={handleFetchNextPagePosts}
                        hasNextPage={hasNextPagePosts}
                        data={postDataResults}
                        isFetching={isFetchingPosts}
                    />
                )}
            </div>
        </div>
    );
}
