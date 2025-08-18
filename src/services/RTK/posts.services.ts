import { PosterType } from "@/constants/enum";
import baseQueryWithReauth from "@/services/RTK/client";
import { GetListCommentRes, GetListPostRes } from "@/types/response/post.type";
import { CreateCommentsReqBodyType } from "@/utils/validations/post.schema";
import { createApi } from "@reduxjs/toolkit/query/react";

export const PostApi = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Posts"],
    reducerPath: "postApi",
    refetchOnMountOrArgChange: true,
    keepUnusedDataFor: 60,
    refetchOnReconnect: true,
    endpoints: (builder) => ({
        likePost: builder.mutation<{ message: string }, string>({
            query: (post_id) => ({
                url: `/posts/likes`,
                method: "POST",
                body: { post_id },
            }),
            invalidatesTags: (result, error, arg) => [{ type: "Posts" as const, id: arg }],
        }),
        unlikePost: builder.mutation<{ message: string }, string>({
            query: (post_id) => ({
                url: `/posts/${post_id}/likes`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, arg) => [{ type: "Posts" as const, id: arg }],
        }),
        bookmarkPost: builder.mutation<{ message: string }, string>({
            query: (post_id) => ({
                url: `/posts/bookmarks`,
                method: "POST",
                body: {
                    post_id,
                },
            }),
            invalidatesTags: (result, error, arg) => [{ type: "Posts" as const, id: arg }],
        }),
        unBookmarkPost: builder.mutation<{ message: string }, string>({
            query: (post_id) => ({
                url: `/posts/${post_id}/bookmarks`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, arg) => [{ type: "Posts" as const, id: arg }],
        }),
        getComments: builder.infiniteQuery<GetListCommentRes, string, number>({
            query: ({ pageParam, queryArg }) =>
                `/posts/${queryArg}/children?page=${pageParam}&limit=10&type=${PosterType.COMMENT}`,
            providesTags: (result, error, parent_id) => {
                if (result) {
                    const final = [
                        ...result.pages.flatMap((page) => {
                            return page.data.posts.map(({ _id }) => ({
                                type: "Posts" as const,
                                id: _id,
                            }));
                        }),
                        { type: "Posts" as const, id: `${parent_id}-COMMENT-LIST` },
                    ];
                    return final;
                }
                return [{ type: "Posts" as const, id: `${parent_id}-COMMENT-LIST` }];
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
        createComment: builder.mutation<{ message: string }, CreateCommentsReqBodyType>({
            query: (body) => ({
                url: `/posts`,
                method: "POST",
                body,
            }),
            invalidatesTags: (result, error, arg) => [{ type: "Posts" as const, id: `${arg.parent_id}-COMMENT-LIST` }],
        }),
        getListPost: builder.infiniteQuery<GetListPostRes, "friend" | "foryou", number>({
            query: ({ pageParam, queryArg }) => `/posts/${queryArg}?page=${pageParam}&limit=10`,
            providesTags: (result, error, arg) => {
                if (result) {
                    const final = [
                        ...result.pages.flatMap((page) => {
                            return page.data.posts.map(({ _id }) => ({
                                type: "Posts" as const,
                                id: _id,
                            }));
                        }),
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

export const {
    useGetListPostInfiniteQuery,
    useLikePostMutation,
    useUnlikePostMutation,
    useBookmarkPostMutation,
    useUnBookmarkPostMutation,
    useGetCommentsInfiniteQuery,
    useCreateCommentMutation,
} = PostApi;
