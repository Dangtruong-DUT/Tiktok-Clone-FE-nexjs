import baseQueryWithReauth from "@/services/RTK/client";
import { createApi } from "@reduxjs/toolkit/query/react";

export const SearchApi = createApi({
    baseQuery: baseQueryWithReauth,
    reducerPath: "SearchApi",
    refetchOnMountOrArgChange: false,
    keepUnusedDataFor: 60,
    refetchOnFocus: false,
    refetchOnReconnect: true,
    endpoints: (builder) => ({}),
});
