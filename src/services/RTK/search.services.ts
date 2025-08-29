import baseQueryWithReauth from "@/services/RTK/client";
import { GetListPostRes } from "@/types/response/post.type";
import { createApi } from "@reduxjs/toolkit/query/react";

export const SearchApi = createApi({
    baseQuery: baseQueryWithReauth,
    reducerPath: "SearchApi",
    refetchOnMountOrArgChange: false,
    keepUnusedDataFor: 60,
    refetchOnFocus: false,
    refetchOnReconnect: true,
    tagTypes: ["Posts"],
    endpoints: (builder) => ({
        searchPosts: builder.infiniteQuery<GetListPostRes, { q: string }, number>({
            query: ({ pageParam, queryArg }) => `/search?page=${pageParam}&limit=10&q=${queryArg.q}`,
            providesTags: (result, error, arg) => {
                if (result) {
                    const final = [
                        ...result.pages.flatMap((page) => {
                            return page.data.posts.map(({ _id }) => ({
                                type: "Posts" as const,
                                id: _id,
                            }));
                        }),
                        { type: "Posts" as const, id: `POST-SEARCH-LIST-${arg.q}` },
                    ];
                    return final;
                }
                return [{ type: "Posts" as const, id: `POST-SEARCH-LIST-${arg.q}` }];
            },
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
    }),
});
