import baseQueryWithReauth from "@/services/RTK/client";
import { GetListPostRes } from "@/types/response/post.type";
import { GetListUserResType } from "@/types/response/user.type";
import { createApi } from "@reduxjs/toolkit/query/react";

export const SearchApi = createApi({
    baseQuery: baseQueryWithReauth,
    reducerPath: "SearchApi",
    refetchOnMountOrArgChange: false,
    keepUnusedDataFor: 60,
    refetchOnFocus: false,
    refetchOnReconnect: true,
    endpoints: (builder) => ({
        searchPosts: builder.infiniteQuery<GetListPostRes, { q: string }, number>({
            query: ({ pageParam, queryArg }) => `/search?page=${pageParam}&limit=10&q=${queryArg.q}`,
            infiniteQueryOptions: {
                initialPageParam: 1,
                getNextPageParam: ({ meta }) => {
                    if (!meta) return undefined;
                    const { page, total_pages } = meta;
                    if (page >= total_pages) return undefined;
                    return page + 1;
                },
                getPreviousPageParam: ({ meta }) => {
                    if (!meta) return undefined;
                    const { page } = meta;
                    if (page <= 1) return undefined;
                    return page - 1;
                },
            },
        }),

        searchUsers: builder.infiniteQuery<GetListUserResType, { q: string }, number>({
            query: ({ pageParam, queryArg }) => `/search/users?page=${pageParam}&limit=10&q=${queryArg.q}`,
            infiniteQueryOptions: {
                initialPageParam: 1,
                getNextPageParam: ({ meta }) => {
                    if (!meta) return undefined;
                    const { page, total_pages } = meta;
                    if (page >= total_pages) return undefined;
                    return page + 1;
                },
                getPreviousPageParam: ({ meta }) => {
                    if (!meta) return undefined;
                    const { page } = meta;
                    if (page <= 1) return undefined;
                    return page - 1;
                },
            },
        }),
        searchUsersGet: builder.query<GetListUserResType, { q: string }>({
            query: ({ q }) => `/search/users?q=${q}`,
        }),
    }),
});

export const { useSearchPostsInfiniteQuery, useSearchUsersInfiniteQuery, useSearchUsersGetQuery } = SearchApi;
