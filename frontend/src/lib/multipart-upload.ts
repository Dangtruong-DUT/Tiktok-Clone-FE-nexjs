import UploadSessionApi from '@/apis/upload-session.request'
import { getExponentialBackoffDelay, sleep } from '@/utils/backoff.util'

export interface UploadedPart {
    partNumber: number
    etag: string
}

export interface MultipartUploadOptions {
    chunkSizeBytes: number
    maxConcurrency: number
    onProgress?: (percent: number) => void
    signal?: AbortSignal
}

const MAX_PART_RETRIES = 3

/**
 * Upload a file to S3/MinIO using S3 multipart upload.
 *
 * Flow per chunk:
 *   1. GET presigned part URL from Laravel.
 *   2. PUT chunk directly to S3.
 *   3. Collect ETag from response header.
 *
 * Chunks are uploaded in batches of `maxConcurrency` with per-chunk retry
 * using exponential backoff (up to MAX_PART_RETRIES attempts).
 */
export async function multipartUpload(
    file: File,
    sessionUuid: string,
    options: MultipartUploadOptions
): Promise<UploadedPart[]> {
    const { chunkSizeBytes, maxConcurrency, onProgress, signal } = options

    const totalParts    = Math.ceil(file.size / chunkSizeBytes)
    const uploadedBytes = new Array<number>(totalParts).fill(0)
    const results: UploadedPart[] = []

    const uploadPart = async (partNumber: number): Promise<UploadedPart> => {
        const start = (partNumber - 1) * chunkSizeBytes
        const end   = Math.min(start + chunkSizeBytes, file.size)
        const chunk = file.slice(start, end)

        for (let attempt = 0; attempt < MAX_PART_RETRIES; attempt++) {
            signal?.throwIfAborted()

            const { data } = await UploadSessionApi.getPartUrl(sessionUuid, partNumber)

            const response = await fetch(data.presigned_url, {
                method: 'PUT',
                body: chunk,
                signal,
            })

            if (!response.ok) {
                if (attempt === MAX_PART_RETRIES - 1) {
                    throw new Error(
                        `Part ${partNumber} upload failed after ${MAX_PART_RETRIES} attempts (HTTP ${response.status})`
                    )
                }
                await sleep(getExponentialBackoffDelay(attempt))
                continue
            }

            const rawEtag = response.headers.get('ETag') ?? ''
            const etag    = rawEtag.replace(/"/g, '')

            uploadedBytes[partNumber - 1] = end - start
            onProgress?.(calcProgress(uploadedBytes, file.size))

            return { partNumber, etag }
        }

        throw new Error(`Part ${partNumber} upload exhausted retries`)
    }

    const queue = Array.from({ length: totalParts }, (_, i) => i + 1)

    while (queue.length > 0) {
        signal?.throwIfAborted()
        const batch        = queue.splice(0, maxConcurrency)
        const batchResults = await Promise.all(batch.map(uploadPart))
        results.push(...batchResults)
    }

    return results.sort((a, b) => a.partNumber - b.partNumber)
}

/**
 * Upload a file to S3/MinIO using a single presigned PUT URL.
 * Uses XHR so we can track byte-level upload progress.
 */
export function singlePresignedUpload(
    file: File,
    presignedUrl: string,
    onProgress?: (percent: number) => void,
    signal?: AbortSignal
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                onProgress?.(Math.round((e.loaded / e.total) * 100))
            }
        })

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve()
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`))
            }
        })

        xhr.addEventListener('error', () => reject(new Error('Network error during upload')))

        signal?.addEventListener('abort', () => {
            xhr.abort()
            reject(new DOMException('Upload aborted', 'AbortError'))
        })

        xhr.open('PUT', presignedUrl)
        xhr.setRequestHeader('Content-Type', 'application/octet-stream')
        xhr.send(file)
    })
}

function calcProgress(uploadedBytes: number[], totalSize: number): number {
    const uploaded = uploadedBytes.reduce((a, b) => a + b, 0)
    return Math.round((uploaded / totalSize) * 100)
}
