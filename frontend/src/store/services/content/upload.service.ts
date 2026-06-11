import baseQueryWithReauth from '@/store/services/base/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import { UploadImageResponse, UploadVideoResponse } from '@/types/dtos/upload/upload-response.dto'
import { VideoEncodingStatusResponse } from '@/types/dtos/upload/video-encoding-status-response.dto'
import { VideoUploadStatusResponse } from '@/types/dtos/upload/video-upload-status-response.dto'
import { createApi } from '@reduxjs/toolkit/query/react'

export const UploadApi = createApi({
    baseQuery: baseQueryWithReauth,
    reducerPath: 'UploadApi',
    endpoints: (builder) => ({
        uploadVideo: builder.mutation<UploadVideoResponse, FormData>({
            query: (formData) => ({
                url: BACKEND_API_ENDPOINT.MEDIA.UPLOAD_VIDEO,
                method: 'POST',
                body: formData
            })
        }),
        uploadImage: builder.mutation<UploadImageResponse, FormData>({
            query: (formData) => ({
                url: BACKEND_API_ENDPOINT.MEDIA.UPLOAD_IMAGE,
                method: 'POST',
                body: formData
            })
        }),

        // Legacy encoding status polling (kept for backward compat)
        getVideoEncodingStatus: builder.query<VideoEncodingStatusResponse, string>({
            query: (uuid) => BACKEND_API_ENDPOINT.VIDEO.ENCODING_STATUS(uuid)
        }),
        retryVideoEncoding: builder.mutation<void, string>({
            query: (uuid) => ({
                url: BACKEND_API_ENDPOINT.VIDEO.RETRY_ENCODING(uuid),
                method: 'POST'
            })
        }),
        cancelVideoUpload: builder.mutation<{ message: string }, string>({
            query: (uuid) => ({
                url: BACKEND_API_ENDPOINT.VIDEO.DELETE(uuid),
                method: 'DELETE'
            })
        }),

        getVideoUploadStatus: builder.query<VideoUploadStatusResponse, string>({
            query: (sessionUuid) => BACKEND_API_ENDPOINT.VIDEO.UPLOAD_SESSION.STATUS(sessionUuid)
        })
    })
})

export const {
    useUploadImageMutation,
    useUploadVideoMutation,
    useGetVideoEncodingStatusQuery,
    useRetryVideoEncodingMutation,
    useCancelVideoUploadMutation,
    useGetVideoUploadStatusQuery
} = UploadApi
