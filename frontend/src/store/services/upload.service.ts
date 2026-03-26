import baseQueryWithReauth from '@/store/services/client'
import { UploadFileResponse } from '@/types/dtos/upload/upload-response.dto'
import { createApi } from '@reduxjs/toolkit/query/react'

export const UploadApi = createApi({
    baseQuery: baseQueryWithReauth,
    reducerPath: 'UploadApi',
    endpoints: (builder) => ({
        uploadVideo: builder.mutation<UploadFileResponse, FormData>({
            query: (formData) => ({
                url: '/medias/upload-video',
                method: 'POST',
                body: formData
            })
        }),
        uploadImage: builder.mutation<UploadFileResponse, FormData>({
            query: (formData) => ({
                url: '/medias/upload-image',
                method: 'POST',
                body: formData
            })
        })
    })
})

export const { useUploadImageMutation, useUploadVideoMutation } = UploadApi
