import { PosterType } from "@/constants/enum";
import baseQueryWithReauth from "@/services/RTK/client";
import { GetListCommentRes, GetListPostRes, GetPostDetailRes } from "@/types/response/post.type";
import {
    CreateCommentsReqBodyType,
    CreatePostReqBodyType,
    UpdatePostReqBodyType,
} from "@/utils/validations/post.schema";
import { createApi } from "@reduxjs/toolkit/query/react";
import _ from "lodash";

export const PostApi = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Posts"],
    reducerPath: "postApi",
    refetchOnMountOrArgChange: false,
    keepUnusedDataFor: 60,
    refetchOnFocus: false,
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
        createComment: builder.mutation<{ message: string }, CreateCommentsReqBodyType & { post_id: string }>({
            query: (payload) => ({
                url: `/posts`,
                method: "POST",
                body: _.omit(payload, "post_id"),
            }),
            invalidatesTags: (result, error, arg) => [
                { type: "Posts" as const, id: `${arg.parent_id}-COMMENT-LIST` },
                { type: "Posts" as const, id: arg.post_id },
                { type: "Posts" as const, id: `${arg.post_id}-COMMENT-LIST` },
            ],
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
                maxPages: 10,
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
        getPostDetail: builder.query<GetPostDetailRes, string>({
            query: (id) => `/posts/${id}`,
            providesTags: (result, error, id) => [{ type: "Posts" as const, id }],
        }),

        getRelatedPosts: builder.infiniteQuery<GetListPostRes, string, number>({
            query: ({ pageParam, queryArg }) => `/posts/${queryArg}/relations?page=${pageParam}&limit=10`,
            providesTags: (result, error, arg) => {
                if (result) {
                    const final = [
                        ...result.pages.flatMap((page) => {
                            return page.data.posts.map(({ _id }) => ({
                                type: "Posts" as const,
                                id: _id,
                            }));
                        }),
                        { type: "Posts" as const, id: `RELATED-${arg}-LIST` },
                    ];
                    return final;
                }
                return [{ type: "Posts" as const, id: `RELATED-${arg}-LIST` }];
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

        getPostOfUser: builder.infiniteQuery<GetListPostRes, string, number>({
            query: ({ pageParam, queryArg }) => `/users/${queryArg}/posts?page=${pageParam}&limit=10`,
            providesTags: (result, error, arg) => {
                if (result) {
                    const final = [
                        ...result.pages.flatMap((page) => {
                            return page.data.posts.map(({ _id }) => ({
                                type: "Posts" as const,
                                id: _id,
                            }));
                        }),
                        { type: "Posts" as const, id: `POST-OF-${arg}-LIST` },
                    ];
                    return final;
                }
                return [{ type: "Posts" as const, id: `POST-OF-${arg}-LIST` }];
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
        getPostOfUserPaging: builder.query<GetListPostRes, { userId: string; page: number }>({
            query: ({ userId, page }) => `/users/${userId}/posts?page=${page}&limit=10`,
            providesTags: (result, error, arg) => {
                if (result) {
                    const final = [
                        ...result.data.posts.map(({ _id }) => ({
                            type: "Posts" as const,
                            id: _id,
                        })),
                        { type: "Posts" as const, id: `POST-OF-CONTENT-LIST` },
                    ];

                    return final;
                }
                return [{ type: "Posts" as const, id: `POST-OF-CONTENT-LIST` }];
            },
        }),
        getBookmarkedPostsOfUser: builder.infiniteQuery<GetListPostRes, string, number>({
            query: ({ pageParam, queryArg }) => `/users/${queryArg}/bookmarks?page=${pageParam}&limit=10`,
            providesTags: (result, error, arg) => {
                if (result) {
                    const final = [
                        ...result.pages.flatMap((page) => {
                            return page.data.posts.map(({ _id }) => ({
                                type: "Posts" as const,
                                id: _id,
                            }));
                        }),
                        { type: "Posts" as const, id: `POST-BOOKMARKS-OF-${arg}-LIST` },
                    ];
                    return final;
                }
                return [{ type: "Posts" as const, id: `POST-BOOKMARKS-OF-${arg}-LIST` }];
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

        getLikedPostsOfUser: builder.infiniteQuery<GetListPostRes, string, number>({
            query: ({ pageParam, queryArg }) => `/users/${queryArg}/liked?page=${pageParam}&limit=10`,
            providesTags: (result, error, arg) => {
                if (result) {
                    const final = [
                        ...result.pages.flatMap((page) => {
                            return page.data.posts.map(({ _id }) => ({
                                type: "Posts" as const,
                                id: _id,
                            }));
                        }),
                        { type: "Posts" as const, id: `POST-LIKED-OF-${arg}-LIST` },
                    ];
                    return final;
                }
                return [{ type: "Posts" as const, id: `POST-LIKED-OF-${arg}-LIST` }];
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
        createPost: builder.mutation<{ message: string }, CreatePostReqBodyType>({
            query: (body) => ({
                url: "/posts",
                method: "POST",
                body,
            }),
            invalidatesTags: (result, error, arg) => [{ type: "Posts" as const, id: `POST-OF-CONTENT-LIST` }],
        }),
        getUnfollowedPosts: builder.infiniteQuery<GetListPostRes, void, number>({
            query: ({ pageParam }) => `/posts/not-following?page=${pageParam}&limit=10`,
            providesTags: (result, error, arg) => {
                if (result) {
                    const final = [
                        ...result.pages.flatMap((page) => {
                            return page.data.posts.map(({ _id }) => ({
                                type: "Posts" as const,
                                id: _id,
                            }));
                        }),
                        { type: "Posts" as const, id: `POST-UNFOLLOWED-LIST` },
                    ];
                    return final;
                }
                return [{ type: "Posts" as const, id: `POST-UNFOLLOWED-LIST` }];
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
        deletePost: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/posts/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, arg) => [{ type: "Posts" as const, id: arg }],
        }),
        updatePost: builder.mutation<{ message: string }, { post_id: string; body: UpdatePostReqBodyType }>({
            query: ({ post_id, body }) => ({
                url: `/posts/${post_id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (result, error, arg) => {
                console.log("Invalidating post with ID:", arg.body);
                return [{ type: "Posts" as const, id: arg.post_id }];
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
    useGetPostDetailQuery,
    useGetRelatedPostsInfiniteQuery,
    useGetPostOfUserInfiniteQuery,
    useGetBookmarkedPostsOfUserInfiniteQuery,
    useGetLikedPostsOfUserInfiniteQuery,
    useGetUnfollowedPostsInfiniteQuery,
    useCreatePostMutation,
    useGetPostOfUserPagingQuery,
    useDeletePostMutation,
    useUpdatePostMutation,
} = PostApi;
