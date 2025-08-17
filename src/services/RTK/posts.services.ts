import baseQueryWithReauth from "@/services/RTK/client";
import { GetListPostRes } from "@/types/response/post.type";
import { createApi } from "@reduxjs/toolkit/query/react";

export const PostApi = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Posts"],
    reducerPath: "postApi",
    refetchOnMountOrArgChange: true,
    keepUnusedDataFor: 60,
    refetchOnReconnect: true,
    endpoints: (builder) => ({
        getListPost: builder.infiniteQuery<GetListPostRes, "friend" | "foryou", number>({
            query: ({ pageParam, queryArg }) => `/posts/${queryArg}?page=${pageParam}&limit=10`,
            providesTags: (result, error, arg) => {
                if (result) {
                    const final = [
                        ...result.pages.flatMap((page) =>
                            page.data.map(({ _id }) => ({
                                type: "Posts" as const,
                                id: _id,
                            }))
                        ),
                        { type: "Posts" as const, id: `${arg}-LIST` }, // phân biệt LIST của friend và foryou
                    ];
                    return final;
                }
                return [{ type: "Posts" as const, id: `${arg}-LIST` }];
            },
            infiniteQueryOptions: {
                initialPageParam: 1,
                maxPages: 5,
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

export const { useGetListPostInfiniteQuery } = PostApi;
