'use client'

import { useCallback, useRef, useState } from 'react'
import UploadSessionApi from '@/apis/upload-session.request'
import { multipartUpload, singlePresignedUpload } from '@/lib/multipart-upload'
import { MULTIPART_CONFIG, VIDEO_UPLOAD_ERROR } from '@/constants/ui/upload'
import type { VideoUploadErrorCode } from '@/constants/ui/upload'

/** Lifecycle phase of the client-side upload operation (distinct from VideoUploadStatus enum). */
export type VideoUploadPhase = 'idle' | 'uploading' | 'done' | 'error'

export interface VideoUploadState {
    status: VideoUploadPhase
    uploadProgress: number
    sessionUuid: string | null
    error: VideoUploadErrorCode | null
    upload: (file: File) => Promise<void>
    cancel: () => void
    retry: () => void
}

export function useVideoUpload(): VideoUploadState {
    const [status, setStatus] = useState<VideoUploadPhase>('idle')
    const [uploadProgress, setProgress] = useState(0)
    const [sessionUuid, setSessionUuid] = useState<string | null>(null)
    const [error, setError] = useState<VideoUploadErrorCode | null>(null)

    const abortControllerRef = useRef<AbortController | null>(null)
    const lastFileRef = useRef<File | null>(null)

    const upload = useCallback(async (file: File) => {
        lastFileRef.current = file
        abortControllerRef.current = new AbortController()
        const signal = abortControllerRef.current.signal

        setStatus('uploading')
        setProgress(0)
        setError(null)
        setSessionUuid(null)

        try {
            const sessionRes = await UploadSessionApi.init({
                file_name: file.name,
                file_size: file.size,
                mime_type: file.type
            })

            const session = sessionRes.data
            setSessionUuid(session.session_uuid)

            let parts: Array<{ part_number: number; etag: string }> | undefined

            if (session.upload_type === 'multipart') {
                const uploadedParts = await multipartUpload(file, session.session_uuid, {
                    chunkSizeBytes: MULTIPART_CONFIG.chunkSizeBytes,
                    maxConcurrency: MULTIPART_CONFIG.maxConcurrency,
                    onProgress: setProgress,
                    signal
                })
                parts = uploadedParts.map((p) => ({
                    part_number: p.partNumber,
                    etag: p.etag
                }))
            } else {
                await singlePresignedUpload(file, session.presigned_url!, setProgress, signal)
            }

            await UploadSessionApi.complete(session.session_uuid, { parts })

            setStatus('done')
            setProgress(100)
        } catch (err) {
            if (isAbortError(err)) {
                setStatus('idle')
                setProgress(0)
                return
            }

            setError(mapError(err))
            setStatus('error')
        }
    }, [])

    const cancel = useCallback(() => {
        abortControllerRef.current?.abort()

        const uuid = sessionUuid
        if (uuid) {
            UploadSessionApi.abort(uuid).catch(() => {})
        }

        setStatus('idle')
        setProgress(0)
        setSessionUuid(null)
        setError(null)
    }, [sessionUuid])

    const retry = useCallback(() => {
        if (lastFileRef.current) {
            upload(lastFileRef.current)
        }
    }, [upload])

    return { status, uploadProgress, sessionUuid, error, upload, cancel, retry }
}

function isAbortError(err: unknown): boolean {
    return err instanceof DOMException && err.name === 'AbortError'
}

function mapError(err: unknown): VideoUploadErrorCode {
    if (err instanceof Response && err.status === 401) return VIDEO_UPLOAD_ERROR.UNAUTHORIZED
    if (err instanceof TypeError || (err instanceof Error && err.message.includes('Network'))) {
        return VIDEO_UPLOAD_ERROR.NETWORK_ERROR
    }
    return VIDEO_UPLOAD_ERROR.SERVER_ERROR
}
