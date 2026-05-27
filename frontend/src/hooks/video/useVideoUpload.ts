'use client'

import { useEffect, useState } from 'react'
import envConfig from '@/config/app.config'

export type VideoUploadStatus = 'idle' | 'uploading' | 'done' | 'error'

export interface UploadedVideo {
    id: number
    uuid: string
    url: string
}

export interface VideoUploadState {
    status: VideoUploadStatus
    uploadProgress: number
    uploadedVideo: UploadedVideo | null
    error: string | null
}

const IDLE: VideoUploadState = {
    status: 'idle',
    uploadProgress: 0,
    uploadedVideo: null,
    error: null,
}

/**
 * Uploads a video file via XHR so we can expose real byte-level progress.
 * RTK Query's fetch-based mutations don't support upload progress events.
 *
 * The hook watches `file` and starts a new upload whenever it changes.
 * Cleanup (xhr.abort) fires on file change or unmount, preventing stale uploads.
 */
export function useVideoUpload(file: File | null): VideoUploadState {
    const [state, setState] = useState<VideoUploadState>(IDLE)

    useEffect(() => {
        if (!file) {
            setState(IDLE)
            return
        }

        setState({ status: 'uploading', uploadProgress: 0, uploadedVideo: null, error: null })

        const xhr = new XMLHttpRequest()

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                setState((prev) => ({ ...prev, uploadProgress: Math.round((e.loaded / e.total) * 100) }))
            }
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const { data } = JSON.parse(xhr.responseText)
                    setState({
                        status: 'done',
                        uploadProgress: 100,
                        uploadedVideo: { id: data.id, uuid: data.uuid, url: data.url },
                        error: null,
                    })
                } catch {
                    setState({ status: 'error', uploadProgress: 0, uploadedVideo: null, error: 'Invalid server response' })
                }
            } else {
                setState({ status: 'error', uploadProgress: 0, uploadedVideo: null, error: `Upload failed (HTTP ${xhr.status})` })
            }
        }

        xhr.onerror = () =>
            setState({ status: 'error', uploadProgress: 0, uploadedVideo: null, error: 'Network error — check your connection' })

        xhr.onabort = () => setState(IDLE)

        const formData = new FormData()
        formData.append('file', file)

        xhr.withCredentials = true
        xhr.open('POST', `${envConfig.NEXT_PUBLIC_API_ENDPOINT}/medias/upload-video`)
        xhr.send(formData)

        return () => xhr.abort()
    }, [file])

    return state
}
