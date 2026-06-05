'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Sparkles, Loader2, CheckCircle2, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { VideoAnalysisTimeline, clipVideoSegment } from './VideoAnalysisTimeline'
import { useAiCopilotContext } from '../AiCopilotContext'

interface AiVideoAttachmentsProps {
    videoUrl: string | null
    onSeek?:  (time: number) => void
}

function fmt(s: number): string {
    const m   = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function AiVideoAttachments({ videoUrl, onSeek }: AiVideoAttachmentsProps) {
    const t = useTranslations('SnapiStudio.aiCopilot')
    const {
        timelineSelection, setTimelineSelection,
        setPendingVideoClip, setPendingMessage, openPanel,
    } = useAiCopilotContext()

    const videoRef  = useRef<HTMLVideoElement>(null)
    const sentSelRef = useRef<{ start: number; end: number } | null>(null)

    const [duration,     setDuration]     = useState(0)
    const [isRecording,  setIsRecording]  = useState(false)
    const [clipProgress, setClipProgress] = useState(0)
    const [clipSent,     setClipSent]     = useState(false)

    const selDur    = timelineSelection ? timelineSelection.end - timelineSelection.start : 0
    const canAnalyze = !!timelineSelection && !isRecording && selDur >= 5 && selDur <= 30

    // Reset "sent" badge when user drags to a new selection
    useEffect(() => {
        if (!clipSent || !sentSelRef.current || !timelineSelection) return
        const { start, end } = sentSelRef.current
        if (timelineSelection.start !== start || timelineSelection.end !== end) {
            setClipSent(false)
        }
    }, [timelineSelection, clipSent])

    const handleAnalyze = useCallback(async () => {
        const video = videoRef.current
        if (!timelineSelection || !video || isRecording) return
        setIsRecording(true)
        setClipProgress(0)
        setClipSent(false)

        const { start, end } = timelineSelection
        const clip = await clipVideoSegment(video, start, end, (elapsed, total) => {
            setClipProgress(Math.min(99, Math.round((elapsed / total) * 100)))
        })

        if (clip) {
            sentSelRef.current = { start, end }
            setPendingVideoClip(clip)
            setTimelineSelection({ start, end })
            setPendingMessage(t('attachments.analyzePrompt', { start: fmt(start), end: fmt(end) }))
            openPanel()
            setClipSent(true)
        }

        setClipProgress(0)
        setIsRecording(false)
    }, [videoRef, timelineSelection, isRecording, setPendingVideoClip, setTimelineSelection, setPendingMessage, openPanel, t])

    const handleReselect = useCallback(() => {
        setClipSent(false)
        sentSelRef.current = null
        // Reset to full selection so user can start fresh
        setTimelineSelection({ start: 0, end: Math.min(30, duration) })
    }, [duration, setTimelineSelection])

    if (!videoUrl) return null

    return (
        <>
            {/* Hidden video element — always mounted so videoRef is available */}
            <video
                ref={videoRef}
                src={videoUrl}
                className='hidden'
                crossOrigin='anonymous'
                preload='metadata'
                onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
            />

            <div className='rounded-xl border border-border bg-card overflow-hidden'>
                {/* ── Header ─────────────────────────────────────────────── */}
                <div className='flex items-center justify-between px-3 py-2 gap-2'>
                    <span className='text-xs font-medium text-foreground'>
                        {t('attachments.panelTitle')}
                    </span>

                    <div className='flex items-center gap-1.5 shrink-0'>
                        {/* After clip is sent: show ✓ badge + re-select button */}
                        {clipSent && !isRecording && (
                            <>
                                <span className='flex items-center gap-1 text-[10px] font-medium text-green-600 dark:text-green-400'>
                                    <CheckCircle2 className='size-3' />
                                    {t('attachments.clipSent')}
                                </span>
                                <button
                                    type='button'
                                    onClick={handleReselect}
                                    className='flex items-center gap-1 text-[10px] font-medium rounded-md px-2 py-1
                                               border border-border text-muted-foreground
                                               hover:bg-muted hover:text-foreground transition-colors'
                                >
                                    <RotateCcw className='size-2.5' />
                                    {t('attachments.reselect')}
                                </button>
                            </>
                        )}

                        {/* Main action button */}
                        <button
                            type='button'
                            disabled={!canAnalyze}
                            onClick={handleAnalyze}
                            className='flex items-center gap-1.5 text-[11px] font-medium rounded-lg px-2.5 py-1
                                       bg-primary text-primary-foreground
                                       disabled:opacity-40 disabled:cursor-not-allowed
                                       hover:opacity-90 active:scale-95 transition-all shrink-0'
                        >
                            {isRecording ? (
                                <>
                                    <Loader2 className='size-3 animate-spin' />
                                    {clipProgress}%
                                </>
                            ) : clipSent ? (
                                <>
                                    <Sparkles className='size-3' />
                                    {t('attachments.reAnalyzeBtn')}
                                </>
                            ) : (
                                <>
                                    <Sparkles className='size-3' />
                                    {t('attachments.analyzeBtn')}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Recording progress bar */}
                {isRecording && (
                    <div className='px-3 pb-1.5'>
                        <div className='h-0.5 w-full rounded-full bg-muted overflow-hidden'>
                            <div
                                className='h-full bg-primary rounded-full transition-all duration-150'
                                style={{ width: `${clipProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* ── Timeline ────────────────────────────────────────────── */}
                <div className='px-3 pb-3 border-t border-border pt-2'>
                    <VideoAnalysisTimeline
                        videoRef={videoRef}
                        duration={duration}
                        onSeek={onSeek}
                    />
                </div>
            </div>
        </>
    )
}
