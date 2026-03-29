import { Audience, PosterType } from '@/constants/enum'
import baseQueryWithReauth from '@/store/services/client'
import { GetListCommentRes, GetListPostRes, GetPostDetailRes } from '@/types/dtos/post/post-response.dto'
import {
    CreateCommentsReqBodyType,
    CreatePostReqBodyType,
    UpdatePostReqBodyType
} from '@/types/dtos/post/post-request.dto'
import { createApi } from '@reduxjs/toolkit/query/react'
import _ from 'lodash'

const getPostEntityTags = (post: { id: number | string; uuid?: string }) => {
    const tags = [{ type: 'Posts' as const, id: post.id }]
    if (post.uuid) {
        tags.push({ type: 'Posts' as const, id: post.uuid })
    }
    return tags
}

export const PostApi = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Posts'],
    reducerPath: 'postApi',
    refetchOnMountOrArgChange: false,
    keepUnusedDataFor: 60,
    refetchOnFocus: false,
    refetchOnReconnect: true,
    endpoints: (builder) => ({
        likePost: builder.mutation<{ message: string }, string>({
            query: (post_uuid) => ({
                url: `/posts/${post_uuid}/like`,
                method: 'POST'
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Posts' as const, id: arg }]
        }),
        unlikePost: builder.mutation<{ message: string }, string>({
            query: (post_uuid) => ({
                url: `/posts/${post_uuid}/like`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Posts' as const, id: arg }]
        }),
        bookmarkPost: builder.mutation<{ message: string }, string>({
            query: (post_uuid) => ({
                url: `/posts/${post_uuid}/bookmark`,
                method: 'POST'
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Posts' as const, id: arg }]
        }),
        unBookmarkPost: builder.mutation<{ message: string }, string>({
            query: (post_uuid) => ({
                url: `/posts/${post_uuid}/bookmark`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Posts' as const, id: arg }]
        }),
        getComments: builder.infiniteQuery<GetListCommentRes, string, number>({
            query: ({ pageParam, queryArg }) =>
                `/posts/${queryArg}/children?page=${pageParam}&per_page=10&type=${PosterType.COMMENT}`,
            providesTags: (result, error, parentId) => {
                void error
                if (result) {
                    const final = [
                        ...result.pages.flatMap((page) => {
                            return page.data.flatMap((post) => getPostEntityTags(post))
                        }),
                        { type: 'Posts' as const, id: `${parentId}-COMMENT-LIST` }
                    ]
                    return final
                }
                return [{ type: 'Posts' as const, id: `${parentId}-COMMENT-LIST` }]
            },
            infiniteQueryOptions: {
                initialPageParam: 1,
                maxPages: 5,
                getNextPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page, last_page } = meta
                    if (current_page >= last_page) return undefined
                    return current_page + 1
                },
                getPreviousPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page } = meta
                    if (current_page <= 1) return undefined
                    return current_page - 1
                }
            }
        }),
        createComment: builder.mutation<{ message: string }, CreateCommentsReqBodyType & { post_uuid: string }>({
            query: (payload) => ({
                url: `/posts`,
                method: 'POST',
                body: _.omit(payload, 'post_uuid')
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Posts' as const, id: `${arg.parent_id}-COMMENT-LIST` },
                { type: 'Posts' as const, id: arg.post_uuid },
                { type: 'Posts' as const, id: `${arg.post_uuid}-COMMENT-LIST` }
            ]
        }),
        getListPost: builder.infiniteQuery<GetListPostRes, 'friend' | 'foryou', number>({
            query: ({ pageParam, queryArg }) => {
                const params = new URLSearchParams({
                    page: String(pageParam),
                    per_page: '10',
                    type: String(PosterType.POST)
                })

                if (queryArg === 'friend') {
                    params.set('audience', String(Audience.FRIENDS))
                }

                if (queryArg === 'foryou') {
                    params.set('audience', String(Audience.PUBLIC))
                }

                return `/posts?${params.toString()}`
            },
            providesTags: (result, error, arg) => {
                void error
                if (result) {
                    const final = [
                        ...result.pages.flatMap((page) => {
                            return page.data.flatMap((post) => getPostEntityTags(post))
                        }),
                        { type: 'Posts' as const, id: `${arg}-LIST` }
                    ]
                    return final
                }
                return [{ type: 'Posts' as const, id: `${arg}-LIST` }]
            },
            infiniteQueryOptions: {
                initialPageParam: 1,
                maxPages: 10,
                getNextPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page, last_page } = meta
                    if (current_page >= last_page) return undefined
                    return current_page + 1
                },
                getPreviousPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page } = meta
                    if (current_page <= 1) return undefined
                    return current_page - 1
                }
            }
        }),
        getPostDetail: builder.query<GetPostDetailRes, string>({
            query: (id) => `/posts/${id}`,
            providesTags: (result, error, id) => {
                void error
                if (result?.data) {
                    return [...getPostEntityTags(result.data), { type: 'Posts' as const, id }]
                }
                return [{ type: 'Posts' as const, id }]
            }
        }),

        getRelatedPosts: builder.infiniteQuery<GetListPostRes, string, number>({
            query: ({ pageParam }) => `/posts?page=${pageParam}&per_page=10&type=${PosterType.POST}`,
            providesTags: (result, error, arg) => {
                if (result) {
                    const final = [
                        ...result.pages.flatMap((page) => {
                            return page.data.flatMap((post) => getPostEntityTags(post))
                        }),
                        { type: 'Posts' as const, id: `RELATED-${arg}-LIST` }
                    ]
                    return final
                }
                return [{ type: 'Posts' as const, id: `RELATED-${arg}-LIST` }]
            },
            infiniteQueryOptions: {
                initialPageParam: 1,
                getNextPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page, last_page } = meta
                    if (current_page >= last_page) return undefined
                    return current_page + 1
                },
                getPreviousPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page } = meta
                    if (current_page <= 1) return undefined
                    return current_page - 1
                }
            }
        }),

        getPostOfUser: builder.infiniteQuery<GetListPostRes, string, number>({
            query: ({ pageParam, queryArg }) =>
                `/users/${queryArg}/posts?page=${pageParam}&per_page=10&type=${PosterType.POST}`,
            providesTags: (result, error, arg) => {
                if (result) {
                    const final = [
                        ...result.pages.flatMap((page) => {
                            return page.data.flatMap((post) => getPostEntityTags(post))
                        }),
                        { type: 'Posts' as const, id: `POST-OF-${arg}-LIST` }
                    ]
                    return final
                }
                return [{ type: 'Posts' as const, id: `POST-OF-${arg}-LIST` }]
            },
            infiniteQueryOptions: {
                initialPageParam: 1,
                getNextPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page, last_page } = meta
                    if (current_page >= last_page) return undefined
                    return current_page + 1
                },
                getPreviousPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page } = meta
                    if (current_page <= 1) return undefined
                    return current_page - 1
                }
            }
        }),
        getPostOfUserPaging: builder.query<
            GetListPostRes,
            { userId: string; page: number; q?: string; audience?: number }
        >({
            query: ({ userId, page, q, audience }) => {
                const params = new URLSearchParams({
                    page: String(page),
                    per_page: '10',
                    type: String(PosterType.POST)
                })

                if (q?.trim()) {
                    params.set('q', q.trim())
                }

                if (typeof audience === 'number') {
                    params.set('audience', String(audience))
                }

                return `/users/${userId}/posts?${params.toString()}`
            },
            providesTags: (result) => {
                if (result) {
                    const final = [
                        ...result.data.flatMap((post) => getPostEntityTags(post)),
                        {
                            type: 'Posts' as const,
                            id: `POST-OF-CONTENT-OF-CURRENT-USER-LIST`
                        }
                    ]

                    return final
                }
                return [
                    {
                        type: 'Posts' as const,
                        id: `POST-OF-CONTENT-OF-CURRENT-USER-LIST`
                    }
                ]
            }
        }),
        getBookmarkedPostsOfUser: builder.infiniteQuery<GetListPostRes, string, number>({
            query: ({ pageParam, queryArg }) =>
                `/users/${queryArg}/bookmark?page=${pageParam}&per_page=10&type=${PosterType.POST}`,
            providesTags: (result, error, arg) => {
                void error
                if (result) {
                    const final = [
                        ...result.pages.flatMap((page) => {
                            return page.data.flatMap((post) => getPostEntityTags(post))
                        }),
                        { type: 'Posts' as const, id: `POST-BOOKMARKS-OF-${arg}-LIST` }
                    ]
                    return final
                }
                return [{ type: 'Posts' as const, id: `POST-BOOKMARKS-OF-${arg}-LIST` }]
            },
            infiniteQueryOptions: {
                initialPageParam: 1,
                getNextPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page, last_page } = meta
                    if (current_page >= last_page) return undefined
                    return current_page + 1
                },
                getPreviousPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page } = meta
                    if (current_page <= 1) return undefined
                    return current_page - 1
                }
            }
        }),

        getLikedPostsOfUser: builder.infiniteQuery<GetListPostRes, string, number>({
            query: ({ pageParam, queryArg }) =>
                `/users/${queryArg}/like?page=${pageParam}&per_page=10&type=${PosterType.POST}`,
            providesTags: (result, error, arg) => {
                void error
                if (result) {
                    const final = [
                        ...result.pages.flatMap((page) => {
                            return page.data.flatMap((post) => getPostEntityTags(post))
                        }),
                        { type: 'Posts' as const, id: `POST-LIKED-OF-${arg}-LIST` }
                    ]
                    return final
                }
                return [{ type: 'Posts' as const, id: `POST-LIKED-OF-${arg}-LIST` }]
            },
            infiniteQueryOptions: {
                initialPageParam: 1,
                getNextPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page, last_page } = meta
                    if (current_page >= last_page) return undefined
                    return current_page + 1
                },
                getPreviousPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page } = meta
                    if (current_page <= 1) return undefined
                    return current_page - 1
                }
            }
        }),
        createPost: builder.mutation<{ message: string }, CreatePostReqBodyType>({
            query: (body) => ({
                url: '/posts',
                method: 'POST',
                body
            }),
            invalidatesTags: (result) =>
                result
                    ? [
                          {
                              type: 'Posts' as const,
                              id: `POST-OF-CONTENT-OF-CURRENT-USER-LIST`
                          }
                      ]
                    : []
        }),
        getUnfollowedPosts: builder.infiniteQuery<GetListPostRes, void, number>({
            query: ({ pageParam }) => `/posts?page=${pageParam}&per_page=10&type=${PosterType.POST}`,
            providesTags: (result) => {
                if (result) {
                    const final = [
                        ...result.pages.flatMap((page) => {
                            return page.data.flatMap((post) => getPostEntityTags(post))
                        }),
                        { type: 'Posts' as const, id: `POST-UNFOLLOWED-LIST` }
                    ]
                    return final
                }
                return [{ type: 'Posts' as const, id: `POST-UNFOLLOWED-LIST` }]
            },
            infiniteQueryOptions: {
                initialPageParam: 1,
                getNextPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page, last_page } = meta
                    if (current_page >= last_page) return undefined
                    return current_page + 1
                },
                getPreviousPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page } = meta
                    if (current_page <= 1) return undefined
                    return current_page - 1
                }
            }
        }),
        getFollowingPosts: builder.infiniteQuery<GetListPostRes, void, number>({
            query: ({ pageParam }) => `/posts/following?page=${pageParam}&per_page=10&type=${PosterType.POST}`,
            providesTags: (result) => {
                if (result) {
                    const final = [
                        ...result.pages.flatMap((page) => {
                            return page.data.flatMap((post) => getPostEntityTags(post))
                        }),
                        { type: 'Posts' as const, id: `POST-FOLLOWING-LIST` }
                    ]
                    return final
                }
                return [{ type: 'Posts' as const, id: `POST-FOLLOWING-LIST` }]
            },
            infiniteQueryOptions: {
                initialPageParam: 1,
                getNextPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page, last_page } = meta
                    if (current_page >= last_page) return undefined
                    return current_page + 1
                },
                getPreviousPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page } = meta
                    if (current_page <= 1) return undefined
                    return current_page - 1
                }
            }
        }),
        getFriendPosts: builder.infiniteQuery<GetListPostRes, void, number>({
            query: ({ pageParam }) => `/posts/friend?page=${pageParam}&per_page=10&type=${PosterType.POST}`,
            providesTags: (result) => {
                if (result) {
                    const final = [
                        ...result.pages.flatMap((page) => {
                            return page.data.flatMap((post) => getPostEntityTags(post))
                        }),
                        { type: 'Posts' as const, id: `POST-FRIEND-LIST` }
                    ]
                    return final
                }
                return [{ type: 'Posts' as const, id: `POST-FRIEND-LIST` }]
            },
            infiniteQueryOptions: {
                initialPageParam: 1,
                getNextPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page, last_page } = meta
                    if (current_page >= last_page) return undefined
                    return current_page + 1
                },
                getPreviousPageParam: ({ meta }) => {
                    if (!meta) return undefined
                    const { current_page } = meta
                    if (current_page <= 1) return undefined
                    return current_page - 1
                }
            }
        }),
        deletePost: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/posts/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Posts' as const, id: arg }]
        }),
        updatePost: builder.mutation<{ message: string }, { post_uuid: string; body: UpdatePostReqBodyType }>({
            query: ({ post_uuid, body }) => ({
                url: `/posts/${post_uuid}`,
                method: 'PATCH',
                body
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Posts' as const, id: arg.post_uuid },
                { type: 'Posts' as const, id: 'POST-OF-CONTENT-OF-CURRENT-USER-LIST' }
            ]
        })
    })
})

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
    useGetFollowingPostsInfiniteQuery,
    useGetFriendPostsInfiniteQuery,
    useCreatePostMutation,
    useGetPostOfUserPagingQuery,
    useDeletePostMutation,
    useUpdatePostMutation
} = PostApi
