'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAiCopilotContext } from '../AiCopilotContext'

interface FilmFrame {
    timestamp: number
    thumbnail: string  // display
    dataUrl: string    // for AI (full size)
}

interface FramePickerProps {
    videoRef: React.RefObject<HTMLVideoElement | null>
    duration: number
}

const MAX_SELECT   = 5
const STRIP_COUNT  = 24   // total frames extracted for the filmstrip

function formatTime(s: number) {
    const m   = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

async function captureFrame(video: HTMLVideoElement, time: number): Promise<FilmFrame | null> {
    return new Promise(resolve => {
        const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked)
            try {
                // Full canvas for AI (max 512px)
                const scale   = Math.min(1, 512 / Math.max(video.videoWidth, video.videoHeight))
                const cvFull  = document.createElement('canvas')
                cvFull.width  = Math.round(video.videoWidth  * scale)
                cvFull.height = Math.round(video.videoHeight * scale)
                cvFull.getContext('2d')?.drawImage(video, 0, 0, cvFull.width, cvFull.height)
                const dataUrl = cvFull.toDataURL('image/jpeg', 0.85)

                // Thumbnail for display (wider for dialog grid)
                const tScale   = Math.min(160 / video.videoWidth, 100 / video.videoHeight)
                const cvThumb  = document.createElement('canvas')
                cvThumb.width  = Math.round(video.videoWidth  * tScale)
                cvThumb.height = Math.round(video.videoHeight * tScale)
                cvThumb.getContext('2d')?.drawImage(video, 0, 0, cvThumb.width, cvThumb.height)
                const thumbnail = cvThumb.toDataURL('image/jpeg', 0.8)

                resolve({ timestamp: time, thumbnail, dataUrl })
            } catch {
                resolve(null)
            }
        }
        video.addEventListener('seeked', onSeeked)
        video.currentTime = time
    })
}

export function FramePicker({ videoRef, duration }: FramePickerProps) {
    const t = useTranslations('SnapiStudio.aiCopilot')
    const { selectedFrames, setSelectedFrames } = useAiCopilotContext()

    const [frames,       setFrames]       = useState<FilmFrame[]>([])
    const [selected,     setSelected]     = useState<Set<number>>(new Set())
    const [isExtracting, setIsExtracting] = useState(false)
    const extractedRef = useRef(false)

    // Auto-extract when video + duration are ready
    useEffect(() => {
        const video = videoRef.current
        if (!video || duration <= 0 || extractedRef.current) return
        extractedRef.current = true

        const count = Math.min(STRIP_COUNT, Math.max(8, Math.ceil(duration / 5)))
        const step  = duration / count

        setIsExtracting(true)
        ;(async () => {
            const result: FilmFrame[] = []
            for (let i = 0; i < count; i++) {
                const ts    = Math.min(step * i, duration - 0.1)
                const frame = await captureFrame(video, ts)
                if (frame) result.push(frame)
            }
            setFrames(result)
            setIsExtracting(false)
        })()
    }, [videoRef, duration])

    const toggle = useCallback((idx: number) => {
        setSelected(prev => {
            const next = new Set(prev)
            if (next.has(idx)) {
                next.delete(idx)
            } else if (next.size < MAX_SELECT) {
                next.add(idx)
            }
            // Update context
            const selectedDataUrls = frames
                .filter((_, i) => next.has(i))
                .map(f => f.dataUrl)
            setSelectedFrames(selectedDataUrls)
            return next
        })
    }, [frames, setSelectedFrames])

    const clearAll = useCallback(() => {
        setSelected(new Set())
        setSelectedFrames([])
    }, [setSelectedFrames])

    // ── Loading state ──────────────────────────────────────────────────────────
    if (isExtracting) {
        return (
            <div className='flex flex-col items-center justify-center gap-3 py-16'>
                <Loader2 className='size-8 animate-spin text-muted-foreground' />
                <p className='text-sm text-muted-foreground'>{t('attachments.extracting')}</p>
            </div>
        )
    }

    if (frames.length === 0) {
        return (
            <p className='text-sm text-muted-foreground text-center py-8'>{t('attachments.frameHint')}</p>
        )
    }

    return (
        <div className='space-y-4'>
            {/* Selection info bar */}
            <div className='flex items-center justify-between'>
                <p className='text-xs text-muted-foreground'>
                    {selected.size === 0
                        ? t('attachments.frameHint')
                        : t('attachments.framesCount', { count: selected.size, max: MAX_SELECT })}
                </p>
                {selected.size > 0 && (
                    <Button type='button' variant='ghost' size='sm' className='h-6 text-xs gap-1 text-muted-foreground'
                        onClick={clearAll}>
                        <X className='size-3' />
                        Clear all
                    </Button>
                )}
            </div>

            {/* Frame grid — scrollable filmstrip window */}
            <div className='overflow-y-auto max-h-[420px] scrollbar-hidden'>
                <div className='grid grid-cols-4 gap-2 pr-1'>
                    {frames.map((frame, idx) => {
                        const isSelected = selected.has(idx)
                        const isDisabled = !isSelected && selected.size >= MAX_SELECT

                        return (
                            <button
                                key={idx}
                                type='button'
                                onClick={() => toggle(idx)}
                                disabled={isDisabled}
                                className={cn(
                                    'relative rounded-lg overflow-hidden border-2 transition-all aspect-video',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                                    isSelected  && 'border-primary ring-2 ring-primary/30',
                                    !isSelected && !isDisabled && 'border-border hover:border-primary/50 cursor-pointer',
                                    isDisabled  && 'border-border opacity-40 cursor-not-allowed',
                                )}
                            >
                                <img
                                    src={frame.thumbnail}
                                    alt={formatTime(frame.timestamp)}
                                    className='w-full h-full object-cover'
                                    draggable={false}
                                />

                                {/* Timestamp overlay */}
                                <div className='absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 text-center'>
                                    <span className='text-[9px] text-white tabular-nums'>{formatTime(frame.timestamp)}</span>
                                </div>

                                {/* Selected overlay */}
                                {isSelected && (
                                    <div className='absolute inset-0 bg-primary/20'>
                                        <div className='absolute top-1 right-1 size-5 rounded-full bg-primary
                                                         flex items-center justify-center shadow-md'>
                                            <Check className='size-3 text-primary-foreground' />
                                        </div>
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Selected frames preview strip */}
            {selected.size > 0 && (
                <div className='border-t border-border pt-3 space-y-1.5'>
                    <p className='text-xs font-medium text-muted-foreground'>Selected for AI analysis:</p>
                    <div className='flex gap-2 flex-wrap'>
                        {Array.from(selected).sort().map(idx => (
                            <div key={idx} className='relative group'>
                                <img
                                    src={frames[idx]?.thumbnail}
                                    alt={formatTime(frames[idx]?.timestamp ?? 0)}
                                    className='h-12 w-20 rounded-md object-cover border border-primary'
                                />
                                <button
                                    type='button'
                                    onClick={() => toggle(idx)}
                                    className='absolute -top-1 -right-1 hidden group-hover:flex items-center justify-center
                                               size-4 rounded-full bg-destructive text-destructive-foreground shadow'
                                >
                                    <X className='size-2.5' />
                                </button>
                                <span className='absolute bottom-0 left-0 right-0 text-center text-[8px]
                                                  text-white bg-black/50 rounded-b-md py-px'>
                                    {formatTime(frames[idx]?.timestamp ?? 0)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
