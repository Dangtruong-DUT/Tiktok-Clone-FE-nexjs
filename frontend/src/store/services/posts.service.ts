import { Audience, PosterType } from '@/constants/enum'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import baseQueryWithReauth from '@/store/services/client'
import { GetListCommentRes, GetListPostRes, GetPostDetailRes } from '@/types/dtos/post/post-response.dto'
import { ApiSuccessResponseWithData } from '@/types/common/http-response.type'
import { TikTokPostType } from '@/types/models/post.model'
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
                url: BACKEND_API_ENDPOINT.POST.LIKE(post_uuid),
                method: 'POST'
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Posts' as const, id: arg }]
        }),
        unlikePost: builder.mutation<{ message: string }, string>({
            query: (post_uuid) => ({
                url: BACKEND_API_ENDPOINT.POST.LIKE(post_uuid),
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Posts' as const, id: arg }]
        }),
        bookmarkPost: builder.mutation<{ message: string }, string>({
            query: (post_uuid) => ({
                url: BACKEND_API_ENDPOINT.POST.BOOKMARK(post_uuid),
                method: 'POST'
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Posts' as const, id: arg }]
        }),
        unBookmarkPost: builder.mutation<{ message: string }, string>({
            query: (post_uuid) => ({
                url: BACKEND_API_ENDPOINT.POST.BOOKMARK(post_uuid),
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Posts' as const, id: arg }]
        }),
        getComments: builder.infiniteQuery<GetListCommentRes, string, number>({
            query: ({ pageParam, queryArg }) =>
                `${BACKEND_API_ENDPOINT.POST.CHILDREN(queryArg)}?page=${pageParam}&per_page=10&type=${PosterType.COMMENT}`,
            providesTags: (result, error, parentId) => {
                void error
                if (result) {
                    return [
                        ...result.pages.flatMap((page) => page.data.flatMap((post) => getPostEntityTags(post))),
                        { type: 'Posts' as const, id: `${parentId}-COMMENT-LIST` }
                    ]
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
                url: BACKEND_API_ENDPOINT.POST.LIST,
                method: 'POST',
                body: _.omit(payload, 'post_uuid')
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Posts' as const, id: arg.post_uuid },
                { type: 'Posts' as const, id: `${arg.post_uuid}-COMMENT-LIST` }
            ]
        }),
        getListPost: builder.infiniteQuery<GetListPostRes, 'friend' | 'foryou', string | null>({
            query: ({ pageParam, queryArg }) => {
                const params = new URLSearchParams({
                    per_page: '10',
                    type: String(PosterType.POST)
                })

                if (pageParam) {
                    params.set('cursor', pageParam)
                }

                if (queryArg === 'friend') {
                    params.set('audience', String(Audience.FRIENDS))
                }

                if (queryArg === 'foryou') {
                    params.set('audience', String(Audience.PUBLIC))
                }

                return `${BACKEND_API_ENDPOINT.POST.LIST}?${params.toString()}`
            },
            providesTags: (result, error, arg) => {
                void error
                if (result) {
                    return [
                        ...result.pages.flatMap((page) => page.data.flatMap((post) => getPostEntityTags(post))),
                        { type: 'Posts' as const, id: `${arg}-LIST` }
                    ]
                }
                return [{ type: 'Posts' as const, id: `${arg}-LIST` }]
            },
            infiniteQueryOptions: {
                initialPageParam: null,
                maxPages: 10,
                getNextPageParam: ({ meta }) => {
                    if (!meta || meta.type !== 'cursor') return undefined
                    return meta.next_cursor ?? undefined
                },
                getPreviousPageParam: ({ meta }) => {
                    if (!meta || meta.type !== 'cursor') return undefined
                    return meta.prev_cursor ?? undefined
                }
            }
        }),
        getPostDetail: builder.query<GetPostDetailRes, string>({
            query: (id) => BACKEND_API_ENDPOINT.POST.DETAIL(id),
            providesTags: (result, error, id) => {
                void error
                if (result?.data) {
                    return [...getPostEntityTags(result.data), { type: 'Posts' as const, id }]
                }
                return [{ type: 'Posts' as const, id }]
            }
        }),

        getRelatedPosts: builder.infiniteQuery<GetListPostRes, string, number>({
            query: ({ pageParam, queryArg }) =>
                `${BACKEND_API_ENDPOINT.POST.RELATED(queryArg)}?page=${pageParam}&per_page=10&type=${PosterType.POST}`,
            providesTags: (result, error, arg) => {
                if (result) {
                    return [
                        ...result.pages.flatMap((page) => page.data.flatMap((post) => getPostEntityTags(post))),
                        { type: 'Posts' as const, id: `RELATED-${arg}-LIST` }
                    ]
                }
                return [{ type: 'Posts' as const, id: `RELATED-${arg}-LIST` }]
            },
            infiniteQueryOptions: {
                initialPageParam: 1,
                getNextPageParam: ({ meta }) => {
                    if (!meta || meta.type !== 'offset') return undefined
                    const { current_page, last_page } = meta
                    if (current_page >= last_page) return undefined
                    return current_page + 1
                },
                getPreviousPageParam: ({ meta }) => {
                    if (!meta || meta.type !== 'offset') return undefined
                    const { current_page } = meta
                    if (current_page <= 1) return undefined
                    return current_page - 1
                }
            }
        }),

        getPostOfUser: builder.infiniteQuery<GetListPostRes, string, number>({
            query: ({ pageParam, queryArg }) =>
                `${BACKEND_API_ENDPOINT.USER.POSTS(queryArg)}?page=${pageParam}&per_page=10&type=${PosterType.POST}`,
            providesTags: (result, error, arg) => {
                if (result) {
                    return [
                        ...result.pages.flatMap((page) => page.data.flatMap((post) => getPostEntityTags(post))),
                        { type: 'Posts' as const, id: `POST-OF-${arg}-LIST` }
                    ]
                }
                return [{ type: 'Posts' as const, id: `POST-OF-${arg}-LIST` }]
            },
            infiniteQueryOptions: {
                initialPageParam: 1,
                getNextPageParam: ({ meta }) => {
                    if (!meta || meta.type !== 'offset') return undefined
                    const { current_page, last_page } = meta
                    if (current_page >= last_page) return undefined
                    return current_page + 1
                },
                getPreviousPageParam: ({ meta }) => {
                    if (!meta || meta.type !== 'offset') return undefined
                    const { current_page } = meta
                    if (current_page <= 1) return undefined
                    return current_page - 1
                }
            }
        }),
        getPostOfUserPaging: builder.query<
            GetListPostRes,
            { userId: string; page: number; per_page?: number; q?: string; audience?: number }
        >({
            query: ({ userId, page, per_page = 10, q, audience }) => {
                const params = new URLSearchParams({
                    page: String(page),
                    per_page: String(per_page),
                    type: String(PosterType.POST)
                })

                if (q?.trim()) {
                    params.set('q', q.trim())
                }

                if (typeof audience === 'number') {
                    params.set('audience', String(audience))
                }

                return `${BACKEND_API_ENDPOINT.USER.POSTS(userId)}?${params.toString()}`
            },
            providesTags: (result) => {
                if (result) {
                    return [
                        ...result.data.flatMap((post) => getPostEntityTags(post)),
                        { type: 'Posts' as const, id: 'POST-OF-CONTENT-OF-CURRENT-USER-LIST' }
                    ]
                }
                return [{ type: 'Posts' as const, id: 'POST-OF-CONTENT-OF-CURRENT-USER-LIST' }]
            }
        }),
        getBookmarkedPostsOfUser: builder.infiniteQuery<GetListPostRes, string, number>({
            query: ({ pageParam, queryArg }) =>
                `${BACKEND_API_ENDPOINT.USER.BOOKMARKS(queryArg)}?page=${pageParam}&per_page=10&type=${PosterType.POST}`,
            providesTags: (result, error, arg) => {
                void error
                if (result) {
                    return [
                        ...result.pages.flatMap((page) => page.data.flatMap((post) => getPostEntityTags(post))),
                        { type: 'Posts' as const, id: `POST-BOOKMARKS-OF-${arg}-LIST` }
                    ]
                }
                return [{ type: 'Posts' as const, id: `POST-BOOKMARKS-OF-${arg}-LIST` }]
            },
            infiniteQueryOptions: {
                initialPageParam: 1,
                getNextPageParam: ({ meta }) => {
                    if (!meta || meta.type !== 'offset') return undefined
                    const { current_page, last_page } = meta
                    if (current_page >= last_page) return undefined
                    return current_page + 1
                },
                getPreviousPageParam: ({ meta }) => {
                    if (!meta || meta.type !== 'offset') return undefined
                    const { current_page } = meta
                    if (current_page <= 1) return undefined
                    return current_page - 1
                }
            }
        }),

        getLikedPostsOfUser: builder.infiniteQuery<GetListPostRes, string, number>({
            query: ({ pageParam, queryArg }) =>
                `${BACKEND_API_ENDPOINT.USER.LIKES(queryArg)}?page=${pageParam}&per_page=10&type=${PosterType.POST}`,
            providesTags: (result, error, arg) => {
                void error
                if (result) {
                    return [
                        ...result.pages.flatMap((page) => page.data.flatMap((post) => getPostEntityTags(post))),
                        { type: 'Posts' as const, id: `POST-LIKED-OF-${arg}-LIST` }
                    ]
                }
                return [{ type: 'Posts' as const, id: `POST-LIKED-OF-${arg}-LIST` }]
            },
            infiniteQueryOptions: {
                initialPageParam: 1,
                getNextPageParam: ({ meta }) => {
                    if (!meta || meta.type !== 'offset') return undefined
                    const { current_page, last_page } = meta
                    if (current_page >= last_page) return undefined
                    return current_page + 1
                },
                getPreviousPageParam: ({ meta }) => {
                    if (!meta || meta.type !== 'offset') return undefined
                    const { current_page } = meta
                    if (current_page <= 1) return undefined
                    return current_page - 1
                }
            }
        }),
        createPost: builder.mutation<ApiSuccessResponseWithData<TikTokPostType>, CreatePostReqBodyType>({
            query: (body) => ({
                url: BACKEND_API_ENDPOINT.POST.LIST,
                method: 'POST',
                body
            }),
            invalidatesTags: (result) =>
                result ? [{ type: 'Posts' as const, id: 'POST-OF-CONTENT-OF-CURRENT-USER-LIST' }] : []
        }),
        getUnfollowedPosts: builder.infiniteQuery<GetListPostRes, void, string | null>({
            query: ({ pageParam }) => {
                const params = new URLSearchParams({ per_page: '10', type: String(PosterType.POST) })
                if (pageParam) params.set('cursor', pageParam)
                return `${BACKEND_API_ENDPOINT.POST.LIST}?${params.toString()}`
            },
            providesTags: (result) => {
                if (result) {
                    return [
                        ...result.pages.flatMap((page) => page.data.flatMap((post) => getPostEntityTags(post))),
                        { type: 'Posts' as const, id: 'POST-UNFOLLOWED-LIST' }
                    ]
                }
                return [{ type: 'Posts' as const, id: 'POST-UNFOLLOWED-LIST' }]
            },
            infiniteQueryOptions: {
                initialPageParam: null,
                getNextPageParam: ({ meta }) => {
                    if (!meta || meta.type !== 'cursor') return undefined
                    return meta.next_cursor ?? undefined
                }
            }
        }),
        getFollowingPosts: builder.infiniteQuery<GetListPostRes, void, string | null>({
            query: ({ pageParam }) => {
                const params = new URLSearchParams({ per_page: '10', type: String(PosterType.POST) })
                if (pageParam) params.set('cursor', pageParam)
                return `${BACKEND_API_ENDPOINT.POST.FOLLOWING}?${params.toString()}`
            },
            providesTags: (result) => {
                if (result) {
                    return [
                        ...result.pages.flatMap((page) => page.data.flatMap((post) => getPostEntityTags(post))),
                        { type: 'Posts' as const, id: 'POST-FOLLOWING-LIST' }
                    ]
                }
                return [{ type: 'Posts' as const, id: 'POST-FOLLOWING-LIST' }]
            },
            infiniteQueryOptions: {
                initialPageParam: null,
                getNextPageParam: ({ meta }) => {
                    if (!meta || meta.type !== 'cursor') return undefined
                    return meta.next_cursor ?? undefined
                }
            }
        }),
        getFriendPosts: builder.infiniteQuery<GetListPostRes, void, string | null>({
            query: ({ pageParam }) => {
                const params = new URLSearchParams({ per_page: '10', type: String(PosterType.POST) })
                if (pageParam) params.set('cursor', pageParam)
                return `${BACKEND_API_ENDPOINT.POST.FRIEND}?${params.toString()}`
            },
            providesTags: (result) => {
                if (result) {
                    return [
                        ...result.pages.flatMap((page) => page.data.flatMap((post) => getPostEntityTags(post))),
                        { type: 'Posts' as const, id: 'POST-FRIEND-LIST' }
                    ]
                }
                return [{ type: 'Posts' as const, id: 'POST-FRIEND-LIST' }]
            },
            infiniteQueryOptions: {
                initialPageParam: null,
                getNextPageParam: ({ meta }) => {
                    if (!meta || meta.type !== 'cursor') return undefined
                    return meta.next_cursor ?? undefined
                }
            }
        }),
        deletePost: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: BACKEND_API_ENDPOINT.POST.DETAIL(id),
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Posts' as const, id: arg }]
        }),
        updatePost: builder.mutation<{ message: string }, { post_uuid: string; body: UpdatePostReqBodyType }>({
            query: ({ post_uuid, body }) => ({
                url: BACKEND_API_ENDPOINT.POST.DETAIL(post_uuid),
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
