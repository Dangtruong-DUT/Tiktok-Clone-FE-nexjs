'use client'

import { useCallback, useState } from 'react'

interface ExtractedFrame {
    timestamp: number  // seconds
    dataUrl: string    // base64 PNG
    thumbnail: string  // smaller thumbnail for display
}

const CAPTURE_SIZE = 512  // max dimension for AI
const THUMB_SIZE   = 96   // thumbnail for UI strip

export function useFrameExtractor(videoEl: HTMLVideoElement | null) {
    const [frames, setFrames] = useState<ExtractedFrame[]>([])

    const captureAtTime = useCallback(
        async (timestamp: number): Promise<ExtractedFrame | null> => {
            if (!videoEl) return null

            return new Promise((resolve) => {
                const onSeeked = () => {
                    videoEl.removeEventListener('seeked', onSeeked)

                    const canvas = document.createElement('canvas')
                    const scale  = Math.min(1, CAPTURE_SIZE / Math.max(videoEl.videoWidth, videoEl.videoHeight))
                    canvas.width  = Math.round(videoEl.videoWidth  * scale)
                    canvas.height = Math.round(videoEl.videoHeight * scale)

                    const ctx = canvas.getContext('2d')
                    if (!ctx) { resolve(null); return }
                    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
                    const dataUrl = canvas.toDataURL('image/png', 0.85)

                    // Make thumbnail
                    const thumbCanvas = document.createElement('canvas')
                    const thumbScale  = THUMB_SIZE / Math.max(canvas.width, canvas.height)
                    thumbCanvas.width  = Math.round(canvas.width  * thumbScale)
                    thumbCanvas.height = Math.round(canvas.height * thumbScale)
                    const tCtx = thumbCanvas.getContext('2d')
                    if (tCtx) tCtx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height)
                    const thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.7)

                    resolve({ timestamp, dataUrl, thumbnail })
                }

                videoEl.addEventListener('seeked', onSeeked)
                videoEl.currentTime = timestamp
            })
        },
        [videoEl],
    )

    const captureCurrentFrame = useCallback(async (): Promise<ExtractedFrame | null> => {
        if (!videoEl) return null
        return captureAtTime(videoEl.currentTime)
    }, [videoEl, captureAtTime])

    const extractFramesAtInterval = useCallback(
        async (startSeconds: number, endSeconds: number, count = 5): Promise<ExtractedFrame[]> => {
            if (!videoEl) return []
            const step   = (endSeconds - startSeconds) / Math.max(count - 1, 1)
            const result: ExtractedFrame[] = []

            for (let i = 0; i < count; i++) {
                const t     = startSeconds + step * i
                const frame = await captureAtTime(t)
                if (frame) result.push(frame)
            }

            setFrames(result)
            return result
        },
        [videoEl, captureAtTime],
    )

    const addFrame = useCallback(async (timestamp: number) => {
        const frame = await captureAtTime(timestamp)
        if (frame) setFrames((prev) => [...prev, frame])
    }, [captureAtTime])

    const removeFrame = useCallback((timestamp: number) => {
        setFrames((prev) => prev.filter((f) => f.timestamp !== timestamp))
    }, [])

    const clearFrames = useCallback(() => setFrames([]), [])

    return {
        frames,
        captureCurrentFrame,
        extractFramesAtInterval,
        addFrame,
        removeFrame,
        clearFrames,
    }
}
