'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { useAiCopilotContext } from '../AiCopilotContext'

const TIMELINE = {
    THUMB_COUNT:   16,
    MIN_DURATION:   5,
    MAX_DURATION:  30,
    CLIP_WIDTH_PX: 640,
    CLIP_FPS:       15,
    CLIP_KBPS:     600,
    PLAYBACK_RATE:   4,
} as const

type DragZone = 'start' | 'end' | 'middle'

interface Thumbnail {
    timestamp: number
    dataUrl:   string
}

interface DragState {
    zone:           DragZone
    startX:         number
    startSel:       { start: number; end: number }
    containerWidth: number
    totalDuration:  number
}

interface VideoAnalysisTimelineProps {
    videoRef: React.RefObject<HTMLVideoElement | null>
    duration: number
    onSeek?:  (time: number) => void
}

function fmt(s: number): string {
    const m   = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '00')}`
}

async function captureThumb(video: HTMLVideoElement, time: number): Promise<string | null> {
    return new Promise(resolve => {
        const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked)
            try {
                const scale = Math.min(1, 160 / Math.max(video.videoWidth, video.videoHeight))
                const cv    = document.createElement('canvas')
                cv.width    = Math.round(video.videoWidth  * scale)
                cv.height   = Math.round(video.videoHeight * scale)
                cv.getContext('2d')?.drawImage(video, 0, 0, cv.width, cv.height)
                resolve(cv.toDataURL('image/jpeg', 0.75))
            } catch {
                resolve(null)
            }
        }
        video.addEventListener('seeked', onSeeked)
        video.currentTime = time
    })
}

export function clipVideoSegment(
    video: HTMLVideoElement,
    start: number,
    end: number,
    onProgress?: (elapsed: number, total: number) => void,
): Promise<string | null> {
    return new Promise(resolve => {
        const scale  = Math.min(1, TIMELINE.CLIP_WIDTH_PX / video.videoWidth)
        const canvas = document.createElement('canvas')
        canvas.width  = Math.round(video.videoWidth  * scale)
        canvas.height = Math.round(video.videoHeight * scale)
        const ctx    = canvas.getContext('2d')

        const stream   = canvas.captureStream(TIMELINE.CLIP_FPS)
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
            ? 'video/webm;codecs=vp8'
            : 'video/webm'

        const recorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: TIMELINE.CLIP_KBPS * 1000,
        })
        const chunks: Blob[] = []

        recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }

        recorder.onstop = () => {
            stream.getTracks().forEach(t => t.stop())
            const blob   = new Blob(chunks, { type: 'video/webm' })
            const reader = new FileReader()
            reader.onload  = () => resolve(reader.result as string)
            reader.onerror = () => resolve(null)
            reader.readAsDataURL(blob)
        }

        const expectedDuration = (end - start) / TIMELINE.PLAYBACK_RATE

        const startRecording = () => {
            recorder.start(200)
            video.playbackRate = TIMELINE.PLAYBACK_RATE
            video.muted        = true
            video.play().catch(() => {})

            const startWall = performance.now()

            const drawLoop = () => {
                if (video.currentTime >= end - 0.05) {
                    video.pause()
                    video.playbackRate = 1
                    recorder.stop()
                    return
                }
                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
                onProgress?.(performance.now() - startWall, expectedDuration * 1000)
                requestAnimationFrame(drawLoop)
            }
            requestAnimationFrame(drawLoop)
        }

        video.addEventListener('seeked', startRecording, { once: true })
        video.currentTime = start
    })
}

export function VideoAnalysisTimeline({ videoRef, duration, onSeek }: VideoAnalysisTimelineProps) {
    const t            = useTranslations('SnapiStudio.aiCopilot')
    const { timelineSelection, setTimelineSelection } = useAiCopilotContext()

    const [thumbnails,      setThumbnails]      = useState<Thumbnail[]>([])
    const [isLoadingThumbs, setIsLoadingThumbs] = useState(false)
    const [currentTime,     setCurrentTime]     = useState(0)

    const containerRef  = useRef<HTMLDivElement>(null)
    const extractedRef  = useRef(false)

    const start       = timelineSelection?.start ?? 0
    const end         = timelineSelection?.end   ?? Math.min(TIMELINE.MAX_DURATION, duration)
    const selDuration = end - start

    const warning: 'too_short' | 'too_long' | null =
        selDuration < TIMELINE.MIN_DURATION ? 'too_short' :
        selDuration > TIMELINE.MAX_DURATION ? 'too_long'  :
        null

    // ── Thumbnail extraction ──────────────────────────────────────────────────
    useEffect(() => {
        const video = videoRef.current
        if (!video || duration <= 0 || extractedRef.current) return
        extractedRef.current = true
        setIsLoadingThumbs(true)
        setTimelineSelection({ start: 0, end: Math.min(TIMELINE.MAX_DURATION, duration) })
        ;(async () => {
            const result: Thumbnail[] = []
            for (let i = 0; i < TIMELINE.THUMB_COUNT; i++) {
                const ts      = Math.min((duration / TIMELINE.THUMB_COUNT) * i, duration - 0.05)
                const dataUrl = await captureThumb(video, ts)
                if (dataUrl) result.push({ timestamp: ts, dataUrl })
            }
            setThumbnails(result)
            setIsLoadingThumbs(false)
        })()
    }, [videoRef, duration, setTimelineSelection])

    // ── Playhead sync ─────────────────────────────────────────────────────────
    useEffect(() => {
        const video = videoRef.current
        if (!video) return
        const handler = () => setCurrentTime(video.currentTime)
        video.addEventListener('timeupdate', handler)
        return () => video.removeEventListener('timeupdate', handler)
    }, [videoRef])

    const pct = (sec: number) =>
        duration > 0 ? Math.max(0, Math.min(100, (sec / duration) * 100)) : 0

    // ── Click strip to seek ───────────────────────────────────────────────────
    const handleStripClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect  = containerRef.current?.getBoundingClientRect()
        const video = videoRef.current
        if (!rect || !video) return
        const seekTo = Math.max(0, Math.min(duration, ((e.clientX - rect.left) / rect.width) * duration))
        video.currentTime = seekTo
        setCurrentTime(seekTo)
        onSeek?.(seekTo)
    }, [duration, videoRef, onSeek])

    // ── Drag handles ──────────────────────────────────────────────────────────
    const startDrag = useCallback((zone: DragZone) => (e: React.PointerEvent) => {
        e.stopPropagation()
        e.preventDefault()
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return

        const state: DragState = {
            zone,
            startX:         e.clientX,
            startSel:       { start, end },
            containerWidth: rect.width,
            totalDuration:  duration,
        }

        const onMove = (ev: PointerEvent) => {
            const dSec = ((ev.clientX - state.startX) / state.containerWidth) * state.totalDuration
            let ns = state.startSel.start
            let ne = state.startSel.end
            const len = ne - ns

            if (zone === 'start') {
                ns = Math.max(0, Math.min(state.startSel.end - TIMELINE.MIN_DURATION, state.startSel.start + dSec))
                ne = Math.min(ns + TIMELINE.MAX_DURATION, state.startSel.end)
            } else if (zone === 'end') {
                ne = Math.min(state.totalDuration, Math.max(state.startSel.start + TIMELINE.MIN_DURATION, state.startSel.end + dSec))
                ns = Math.max(ne - TIMELINE.MAX_DURATION, state.startSel.start)
            } else {
                ns = Math.max(0, Math.min(state.totalDuration - len, state.startSel.start + dSec))
                ne = ns + len
            }

            setTimelineSelection({ start: Math.round(ns * 4) / 4, end: Math.round(ne * 4) / 4 })
        }

        const onUp = () => {
            document.removeEventListener('pointermove', onMove)
            document.removeEventListener('pointerup',   onUp)
        }

        document.addEventListener('pointermove', onMove)
        document.addEventListener('pointerup',   onUp)
    }, [start, end, duration, setTimelineSelection])

    if (duration <= 0) return null

    return (
        <div className='space-y-1.5'>
            {/* Thumbnail filmstrip with drag handles */}
            <div
                ref={containerRef}
                className='relative w-full h-12 rounded-xl overflow-hidden bg-muted cursor-crosshair select-none'
                onClick={handleStripClick}
            >
                {isLoadingThumbs ? (
                    <div className='absolute inset-0 flex items-center justify-center gap-1.5'>
                        <Loader2 className='size-3.5 animate-spin text-muted-foreground' />
                        <span className='text-[10px] text-muted-foreground'>{t('attachments.loadingThumbs')}</span>
                    </div>
                ) : (
                    <div className='flex h-full'>
                        {thumbnails.map((thumb, i) => (
                            <div key={i} className='flex-1 min-w-0 h-full'>
                                <img src={thumb.dataUrl} alt='' className='w-full h-full object-cover' draggable={false} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Dimmed areas outside selection */}
                {timelineSelection && (
                    <>
                        <div className='absolute inset-y-0 left-0 bg-background/60 pointer-events-none' style={{ width: `${pct(start)}%` }} />
                        <div className='absolute inset-y-0 right-0 bg-background/60 pointer-events-none' style={{ width: `${100 - pct(end)}%` }} />
                    </>
                )}

                {/* Draggable selection zone */}
                {timelineSelection && (
                    <div
                        className='absolute inset-y-0 border-2 border-primary cursor-grab active:cursor-grabbing'
                        style={{ left: `${pct(start)}%`, width: `${pct(end) - pct(start)}%` }}
                        onPointerDown={startDrag('middle')}
                    >
                        <div className='absolute inset-y-0 left-0 w-3 flex items-center justify-center cursor-ew-resize bg-primary z-10' onPointerDown={startDrag('start')}>
                            <div className='w-0.5 h-3 rounded-full bg-primary-foreground' />
                        </div>
                        <div className='absolute inset-y-0 right-0 w-3 flex items-center justify-center cursor-ew-resize bg-primary z-10' onPointerDown={startDrag('end')}>
                            <div className='w-0.5 h-3 rounded-full bg-primary-foreground' />
                        </div>
                    </div>
                )}

                {/* Playhead */}
                <div className='absolute inset-y-0 w-px bg-white/90 shadow pointer-events-none z-20' style={{ left: `${pct(currentTime)}%` }} />
            </div>

            {/* Time info + warning */}
            {timelineSelection && (
                <div className='flex items-center justify-between text-[10px] tabular-nums'>
                    <span className='text-muted-foreground font-medium'>{fmt(start)}</span>
                    <span className={cn(
                        'font-semibold px-2 py-0.5 rounded-full text-[9px]',
                        warning === 'too_long'  && 'bg-destructive/10 text-destructive',
                        warning === 'too_short' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                        !warning               && 'bg-primary/10 text-primary',
                    )}>
                        {fmt(selDuration)}
                        {warning === 'too_long'  && ` · max ${TIMELINE.MAX_DURATION}s`}
                        {warning === 'too_short' && ` · min ${TIMELINE.MIN_DURATION}s`}
                    </span>
                    <span className='text-muted-foreground font-medium'>{fmt(end)}</span>
                </div>
            )}

        </div>
    )
}
