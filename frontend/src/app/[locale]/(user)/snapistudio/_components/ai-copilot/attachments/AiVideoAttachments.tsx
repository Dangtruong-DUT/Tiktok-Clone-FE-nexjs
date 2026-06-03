'use client'

import { useRef, useState } from 'react'
import { Film, AlarmClock, ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TimelineSelector } from './TimelineSelector'
import { FramePicker } from './FramePicker'
import { useAiCopilotContext } from '../AiCopilotContext'

interface AiVideoAttachmentsProps {
    videoUrl: string | null
}

export function AiVideoAttachments({ videoUrl }: AiVideoAttachmentsProps) {
    const t = useTranslations('SnapiStudio.aiCopilot')
    const { selectedFrames } = useAiCopilotContext()
    const videoRef = useRef<HTMLVideoElement>(null)
    const [duration, setDuration] = useState(0)
    const [timelineOpen, setTimelineOpen] = useState(false)

    if (!videoUrl) return null

    return (
        <>
            {/* Hidden video — always mounted so videoRef.current is populated for canvas capture */}
            <video
                ref={videoRef}
                src={videoUrl}
                className='hidden'
                crossOrigin='anonymous'
                preload='metadata'
                onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
            />

            <div className='rounded-xl border border-border bg-card overflow-hidden'>
                {/* Header */}
                <button
                    type='button'
                    className='w-full flex items-center justify-between px-4 py-2.5
                               hover:bg-muted/40 transition-colors'
                    onClick={() => setTimelineOpen(v => !v)}
                >
                    <div className='flex items-center gap-2 text-sm font-medium text-foreground'>
                        <Film className='size-4 text-primary' />
                        {t('attachments.panelTitle')}
                        {selectedFrames.length > 0 && (
                            <span className='ml-1 text-xs text-primary font-semibold'>
                                ({selectedFrames.length})
                            </span>
                        )}
                    </div>
                    {timelineOpen
                        ? <ChevronUp className='size-4 text-muted-foreground' />
                        : <ChevronDown className='size-4 text-muted-foreground' />}
                </button>

                {timelineOpen && (
                    <div className='px-4 pb-4 pt-2 space-y-4 border-t border-border'>
                        {/* Timeline segment selector (inline) */}
                        <div className='space-y-1.5'>
                            <div className='flex items-center gap-1.5'>
                                <AlarmClock className='size-3.5 text-muted-foreground' />
                                <span className='text-xs font-medium text-muted-foreground'>
                                    {t('attachments.timelineLabel')}
                                </span>
                            </div>
                            <TimelineSelector duration={duration} />
                        </div>

                        {/* Frame picker — opens in a dialog window */}
                        <div className='space-y-1.5'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-1.5'>
                                    <Film className='size-3.5 text-muted-foreground' />
                                    <span className='text-xs font-medium text-muted-foreground'>
                                        {t('attachments.frameLabel')}
                                    </span>
                                </div>
                                {selectedFrames.length > 0 && (
                                    <span className='text-[10px] text-primary font-medium'>
                                        {selectedFrames.length} selected
                                    </span>
                                )}
                            </div>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        className='w-full gap-2 text-xs h-8'
                                        disabled={duration <= 0}
                                    >
                                        <Film className='size-3.5' />
                                        {selectedFrames.length > 0
                                            ? t('attachments.framesCount', { count: selectedFrames.length, max: 5 })
                                            : t('attachments.openFilmstrip')}
                                    </Button>
                                </DialogTrigger>

                                <DialogContent className='max-w-3xl w-full'>
                                    <DialogHeader>
                                        <DialogTitle className='flex items-center gap-2 text-base'>
                                            <Film className='size-4 text-primary' />
                                            {t('attachments.frameLabel')}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <FramePicker videoRef={videoRef} duration={duration} />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
