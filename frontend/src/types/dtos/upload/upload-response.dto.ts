import { MediaType } from '@/constants/enum'
import { HttpResponseWithData } from '@/types/common/http-response.type'

export type UploadFileResponse = HttpResponseWithData<{
    id: number
    url: string
    type: MediaType.HLS_VIDEO | MediaType.VIDEO | MediaType.IMAGE
}>
