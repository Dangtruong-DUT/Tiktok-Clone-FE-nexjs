import baseQueryWithReauth from '@/store/services/client'
import { VIDEO_API_ENDPOINT } from '@/constants/api/endpoints'
import { UploadImageResponse, UploadVideoResponse } from '@/types/dtos/upload/upload-response.dto'
import { VideoEncodingStatusResponse } from '@/types/dtos/upload/video-encoding-status-response.dto'
import { createApi } from '@reduxjs/toolkit/query/react'

export const UploadApi = createApi({
    baseQuery: baseQueryWithReauth,
    reducerPath: 'UploadApi',
    endpoints: (builder) => ({
        uploadVideo: builder.mutation<UploadVideoResponse, FormData>({
            query: (formData) => ({
                url: '/medias/upload-video',
                method: 'POST',
                body: formData
            })
        }),
        uploadImage: builder.mutation<UploadImageResponse, FormData>({
            query: (formData) => ({
                url: '/medias/upload-image',
                method: 'POST',
                body: formData
            })
        }),
        getVideoEncodingStatus: builder.query<VideoEncodingStatusResponse, string>({
            query: (uuid) => VIDEO_API_ENDPOINT.API_VIDEO_ENCODING_STATUS(uuid)
        })
    })
})

export const {
    useUploadImageMutation,
    useUploadVideoMutation,
    useGetVideoEncodingStatusQuery
} = UploadApi
