"use client";

import Header from "@/app/[locale]/(public)/(home)/search/_components/tabbar-header";
import { TabbarItemsId } from "@/app/[locale]/(public)/(home)/search/_config/tabbar-items";
import { SearchParamsLoader, useSearchParamsLoader } from "@/components/searchparams-loader";
import { useSearchPostsInfiniteQuery, useSearchUsersInfiniteQuery } from "@/services/RTK/search.services";
import { useState } from "react";
import UsersContainer from "@/app/[locale]/(public)/(home)/search/_components/users-container";
import PostsContainer from "@/app/[locale]/(public)/(home)/search/_components/posts-container";
import { MdSearchOff } from "react-icons/md";

export default function SearchResults() {
    const [tabActive, setTabActive] = useState<TabbarItemsId>("USERS");
    const { setSearchParams, searchParams } = useSearchParamsLoader();
    const query = searchParams?.get("q") || "";
    const {
        fetchNextPage: handleFetchNextPageUsers,
        hasNextPage: hasNextPageUsers,
        data: dataUsers,
        isFetching: isFetchingUsers,
        isLoading: isLoadingUsers,
    } = useSearchUsersInfiniteQuery({ q: query ?? "" }, { skip: tabActive !== "USERS" });

    const {
        fetchNextPage: handleFetchNextPagePosts,
        hasNextPage: hasNextPagePosts,
        data: dataPosts,
        isFetching: isFetchingPosts,
        isLoading: isLoadingPosts,
    } = useSearchPostsInfiniteQuery({ q: query ?? "" }, { skip: tabActive !== "VIDEOS" });

    const userDataResults = dataUsers?.pages.flatMap((page) => page.data) || [];
    const postDataResults = dataPosts?.pages.flatMap((page) => page.data) || [];

    const activeResultUserTab = tabActive === "USERS" && (userDataResults.length > 0 || isLoadingUsers);
    const activeResultVideoTab = tabActive === "VIDEOS" && (postDataResults.length > 0 || isLoadingPosts);

    return (
        <div className="p-4 mx-auto max-w-[800px] w-[73%] min-w-[420px]">
            <SearchParamsLoader onParamsReceived={setSearchParams} />
            <Header tabActive={tabActive} setTabActive={setTabActive} />
            <div>
                {activeResultUserTab && (
                    <UsersContainer
                        fetchNextPage={handleFetchNextPageUsers}
                        hasNextPage={hasNextPageUsers}
                        data={userDataResults}
                        isFetching={isFetchingUsers}
                        isLoading={isLoadingUsers}
                    />
                )}
                {activeResultVideoTab && (
                    <PostsContainer
                        fetchNextPage={handleFetchNextPagePosts}
                        hasNextPage={hasNextPagePosts}
                        data={postDataResults}
                        isFetching={isFetchingPosts}
                        isLoading={isLoadingPosts}
                    />
                )}
                {!activeResultUserTab && !activeResultVideoTab && (
                    <div className="mx-auto flex flex-col justify-center items-center min-h-[490px]">
                        <div className="flex justify-center items-center size-[92px] rounded-full bg-muted">
                            <MdSearchOff size={44} />
                        </div>
                        <p className="text-2xl font-bold mt-6">No results found</p>
                        <p className="text-base mt-2 text-muted-foreground">Try searching with a different keyword.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
