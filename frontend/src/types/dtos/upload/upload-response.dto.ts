import { MediaType } from '@/constants/enum'
import { HttpResponseWithData } from '@/types/common/http-response.type'

export type UploadVideoResponse = HttpResponseWithData<{
    id: number
    uuid: string
    url: string
    type: MediaType.VIDEO
}>

export type UploadImageResponse = HttpResponseWithData<{
    id: number
    url: string
    type: MediaType.IMAGE
}>

/** @deprecated Prefer UploadVideoResponse or UploadImageResponse */
export type UploadFileResponse = UploadVideoResponse | UploadImageResponse
