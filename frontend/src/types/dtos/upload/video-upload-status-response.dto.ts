import { VideoUploadStatus } from '@/constants/enum'
import { HttpResponseWithData } from '@/types/common/http-response.type'

export type VideoUploadStatusResponse = HttpResponseWithData<{
    session_uuid: string
    status: VideoUploadStatus
    status_label: string
    is_terminal: boolean
    encoding_progress: number
    master_playlist_url: string | null
    metadata: {
        duration: number | null
        width: number | null
        height: number | null
        bitrate: number | null
    } | null
}>
