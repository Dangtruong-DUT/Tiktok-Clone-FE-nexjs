import { HttpResponseWithData } from '@/types/common/http-response.type'

export type UploadSessionResponse = HttpResponseWithData<{
    session_uuid: string
    upload_type: 'single' | 'multipart'
    upload_id: string | null
    presigned_url: string | null
    chunk_size_bytes: number
    expires_at: string
}>

export type PartPresignedUrlResponse = HttpResponseWithData<{
    presigned_url: string
    part_number: number
}>
