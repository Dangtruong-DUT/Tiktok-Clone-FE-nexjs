import httpClient from '@/apis/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import {
    CompleteUploadSessionBody,
    InitUploadSessionBody,
} from '@/types/dtos/upload/upload-session-request.dto'
import {
    PartPresignedUrlResponse,
    UploadSessionResponse,
} from '@/types/dtos/upload/upload-session-response.dto'
import { VideoUploadStatusResponse } from '@/types/dtos/upload/video-upload-status-response.dto'

const CREDENTIALS: RequestInit = { credentials: 'include' }

const UploadSessionApi = {
    /**
     * Initialise a new upload session and receive presigned upload credentials.
     */
    init: (body: InitUploadSessionBody) =>
        httpClient.post<UploadSessionResponse>(
            BACKEND_API_ENDPOINT.VIDEO.UPLOAD_SESSION.INIT,
            body,
            CREDENTIALS
        ),

    /**
     * Fetch a presigned URL for a single part of a multipart upload.
     */
    getPartUrl: (sessionUuid: string, partNumber: number) =>
        httpClient.get<PartPresignedUrlResponse>(
            BACKEND_API_ENDPOINT.VIDEO.UPLOAD_SESSION.PART_URL(sessionUuid, partNumber),
            CREDENTIALS
        ),

    /**
     * Signal that all parts have been uploaded and finalise the session.
     */
    complete: (sessionUuid: string, body: CompleteUploadSessionBody) =>
        httpClient.put<VideoUploadStatusResponse>(
            BACKEND_API_ENDPOINT.VIDEO.UPLOAD_SESSION.COMPLETE(sessionUuid),
            body,
            CREDENTIALS
        ),

    /**
     * Poll the current status and encoding progress of a session.
     */
    getStatus: (sessionUuid: string) =>
        httpClient.get<VideoUploadStatusResponse>(
            BACKEND_API_ENDPOINT.VIDEO.UPLOAD_SESSION.STATUS(sessionUuid),
            CREDENTIALS
        ),

    /**
     * Abort an active session and clean up any stored objects.
     */
    abort: (sessionUuid: string) =>
        httpClient.delete<void>(
            BACKEND_API_ENDPOINT.VIDEO.UPLOAD_SESSION.ABORT(sessionUuid),
            CREDENTIALS
        ),
}

export default UploadSessionApi
