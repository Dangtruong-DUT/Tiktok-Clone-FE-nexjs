import { EncodingStatus } from '@/constants/enum'
import { HttpResponseWithData } from '@/types/common/http-response.type'

export type VideoEncodingStatusResponse = HttpResponseWithData<{
    status: EncodingStatus
    status_label: string
    progress: number
    master_playlist_url: string | null
    duration: number | null
    width: number | null
    height: number | null
    resolutions: string[] | null
}>
