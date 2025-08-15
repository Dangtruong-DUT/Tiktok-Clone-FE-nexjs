import { API_ENDPOINT } from "@/config/endpoint.config";
import baseQueryWithReauth from "@/services/RTK/client";
import { GETForyouPostRes, GETFriendPostRes } from "@/types/response/post.type";
import { createApi } from "@reduxjs/toolkit/query/react";

export const PostApi = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Posts"],
    reducerPath: "postApi",
    refetchOnMountOrArgChange: true,
    keepUnusedDataFor: 60,
    refetchOnReconnect: true,
    endpoints: (builder) => ({
        getForyouPosts: builder.query<GETForyouPostRes, void>({
            query: () => API_ENDPOINT.API_GET_FORYOU_POSTS,
            providesTags: (result) => {
                if (result) {
                    const final = [
                        ...result.data.map(({ _id }) => ({ type: "Posts" as const, id: _id })),
                        { type: "Posts" as const, id: "LIST" },
                    ];
                    return final;
                }
                const final = [{ type: "Posts" as const, id: "LIST" }];
                return final;
            },
        }),
        getFriendPosts: builder.query<GETFriendPostRes, void>({
            query: () => API_ENDPOINT.API_GET_FRIEND_POSTS,
            providesTags: (result) => {
                if (result) {
                    const final = [
                        ...result.data.map(({ _id }) => ({ type: "Posts" as const, id: _id })),
                        { type: "Posts" as const, id: "LIST" },
                    ];
                    return final;
                }
                const final = [{ type: "Posts" as const, id: "LIST" }];
                return final;
            },
        }),
    }),
});

export const { useGetForyouPostsQuery, useGetFriendPostsQuery } = PostApi;
