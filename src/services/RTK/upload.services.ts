import baseQueryWithReauth from "@/services/RTK/client";
import { createApi } from "@reduxjs/toolkit/query/react";

export const UploadApi = createApi({
    baseQuery: baseQueryWithReauth,
    reducerPath: "UploadApi",
    endpoints: (builder) => ({
        uploadVideo: builder.mutation<{ message: string }, FormData>({
            query: (formData) => ({
                url: "/medias/upload-video",
                method: "POST",
                body: formData,
            }),
        }),
        uploadImage: builder.mutation<{ message: string }, FormData>({
            query: (formData) => ({
                url: "/medias/upload-image",
                method: "POST",
                body: formData,
            }),
        }),
    }),
});

export const { useUploadImageMutation, useUploadVideoMutation } = UploadApi;
