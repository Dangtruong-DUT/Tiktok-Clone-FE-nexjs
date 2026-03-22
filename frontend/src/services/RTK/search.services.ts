import baseQueryWithReauth from "@/services/RTK/client";
import { SearchPostRes } from "@/types/response/post.type";
import { GetListUserResType } from "@/types/response/user.type";
import { createApi } from "@reduxjs/toolkit/query/react";
import { PosterType } from "@/constants/enum";

export const SearchApi = createApi({
  baseQuery: baseQueryWithReauth,
  reducerPath: "SearchApi",
  refetchOnMountOrArgChange: false,
  keepUnusedDataFor: 60,
  refetchOnFocus: false,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    searchPosts: builder.infiniteQuery<SearchPostRes, { q: string }, number>({
      query: ({ pageParam, queryArg }) =>
        `/search/posts?page=${pageParam}&per_page=10&type=${PosterType.POST}&q=${queryArg.q}`,
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: ({ meta }) => {
          if (!meta) return undefined;
          const { current_page, last_page } = meta;
          if (current_page >= last_page) return undefined;
          return current_page + 1;
        },
        getPreviousPageParam: ({ meta }) => {
          if (!meta) return undefined;
          const { current_page } = meta;
          if (current_page <= 1) return undefined;
          return current_page - 1;
        },
      },
    }),

    searchUsers: builder.infiniteQuery<
      GetListUserResType,
      { q: string },
      number
    >({
      query: ({ pageParam, queryArg }) =>
        `/search/users?page=${pageParam}&per_page=10&q=${queryArg.q}`,
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: ({ meta }) => {
          if (!meta) return undefined;
          const { current_page, last_page } = meta;
          if (current_page >= last_page) return undefined;
          return current_page + 1;
        },
        getPreviousPageParam: ({ meta }) => {
          if (!meta) return undefined;
          const { current_page } = meta;
          if (current_page <= 1) return undefined;
          return current_page - 1;
        },
      },
    }),
    searchUsersGet: builder.query<GetListUserResType, { q: string }>({
      query: ({ q }) => `/search/users?q=${q}`,
    }),
  }),
});

export const {
  useSearchPostsInfiniteQuery,
  useSearchUsersInfiniteQuery,
  useSearchUsersGetQuery,
} = SearchApi;
