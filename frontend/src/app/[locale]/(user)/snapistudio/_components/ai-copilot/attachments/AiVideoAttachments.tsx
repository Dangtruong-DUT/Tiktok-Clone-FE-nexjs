'use client'

import { useRef, useState } from 'react'
import { Film, ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { VideoAnalysisTimeline } from './VideoAnalysisTimeline'

interface AiVideoAttachmentsProps {
    videoUrl: string | null
    onSeek?:  (time: number) => void
}

export function AiVideoAttachments({ videoUrl, onSeek }: AiVideoAttachmentsProps) {
    const t = useTranslations('SnapiStudio.aiCopilot')
    const videoRef = useRef<HTMLVideoElement>(null)
    const [duration, setDuration] = useState(0)
    const [timelineOpen, setTimelineOpen] = useState(false)

    if (!videoUrl) return null

    return (
        <>
            {/* Hidden video — always mounted so videoRef.current is available for canvas capture */}
            <video
                ref={videoRef}
                src={videoUrl}
                className='hidden'
                crossOrigin='anonymous'
                preload='metadata'
                onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
            />

            <div className='rounded-xl border border-border bg-card overflow-hidden'>
                <button
                    type='button'
                    className='w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/40 transition-colors'
                    onClick={() => setTimelineOpen(v => !v)}
                >
                    <div className='flex items-center gap-2 text-sm font-medium text-foreground'>
                        <Film className='size-4 text-primary' />
                        {t('attachments.panelTitle')}
                    </div>
                    {timelineOpen
                        ? <ChevronUp className='size-4 text-muted-foreground' />
                        : <ChevronDown className='size-4 text-muted-foreground' />}
                </button>

                {timelineOpen && (
                    <div className='px-4 pb-4 pt-2 border-t border-border'>
                        <VideoAnalysisTimeline videoRef={videoRef} duration={duration} onSeek={onSeek} />
                    </div>
                )}
            </div>
        </>
    )
}
