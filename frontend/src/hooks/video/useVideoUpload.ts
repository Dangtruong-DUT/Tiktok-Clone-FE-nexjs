'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
    retry: () => void
}

const UPLOAD_URL = `${envConfig.NEXT_PUBLIC_API_ENDPOINT}/medias/upload-video`

/**
 * Uploads a video file via XHR so we can expose real byte-level progress.
 * RTK Query's fetch-based mutations don't support upload progress events.
 *
 * Exposes `retry()` to re-attempt the same file after a network/server error
 * without requiring the user to re-select the file.
 */
export function useVideoUpload(file: File | null): VideoUploadState {
    const [status, setStatus] = useState<VideoUploadStatus>('idle')
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [retryCount, setRetryCount] = useState(0)

    const xhrRef = useRef<XMLHttpRequest | null>(null)

    useEffect(() => {
        if (!file) {
            xhrRef.current?.abort()
            setStatus('idle')
            setUploadProgress(0)
            setUploadedVideo(null)
            setError(null)
            return
        }

        setStatus('uploading')
        setUploadProgress(0)
        setUploadedVideo(null)
        setError(null)

        const xhr = new XMLHttpRequest()
        xhrRef.current = xhr

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                setUploadProgress(Math.round((e.loaded / e.total) * 100))
            }
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const { data } = JSON.parse(xhr.responseText)
                    setUploadedVideo({ id: data.id, uuid: data.uuid, url: data.url })
                    setStatus('done')
                    setUploadProgress(100)
                } catch {
                    setError('Phản hồi từ server không hợp lệ')
                    setStatus('error')
                }
            } else {
                setError(xhr.status === 401
                    ? 'Vui lòng đăng nhập để tải video'
                    : `Tải lên thất bại (HTTP ${xhr.status})`)
                setStatus('error')
            }
        }

        xhr.onerror = () => {
            setError('Lỗi mạng — kiểm tra kết nối và thử lại')
            setStatus('error')
        }

        xhr.onabort = () => {
            setStatus('idle')
            setUploadProgress(0)
        }

        const formData = new FormData()
        formData.append('file', file)

        xhr.withCredentials = true
        xhr.open('POST', UPLOAD_URL)
        xhr.send(formData)

        return () => xhr.abort()
    }, [file, retryCount])

    const retry = useCallback(() => {
        if (status === 'error') {
            setRetryCount((c) => c + 1)
        }
    }, [status])

    return { status, uploadProgress, uploadedVideo, error, retry }
}
