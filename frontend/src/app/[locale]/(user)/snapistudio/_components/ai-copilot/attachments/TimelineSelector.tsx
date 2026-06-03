'use client'

import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useAiCopilotContext } from '../AiCopilotContext'

interface TimelineSelectorProps {
    duration: number
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function TimelineSelector({ duration }: TimelineSelectorProps) {
    const t = useTranslations('SnapiStudio.aiCopilot')
    const { timelineSelection, setTimelineSelection } = useAiCopilotContext()

    const start = timelineSelection?.start ?? 0
    const end   = timelineSelection?.end ?? duration
    const pct   = (sec: number) => (duration > 0 ? (sec / duration) * 100 : 0)

    const handleStartChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = parseFloat(e.target.value)
            setTimelineSelection({ start: val, end: Math.max(val + 1, end) })
        },
        [end, setTimelineSelection],
    )

    const handleEndChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = parseFloat(e.target.value)
            setTimelineSelection({ start: Math.min(start, val - 1), end: val })
        },
        [start, setTimelineSelection],
    )

    const activate = useCallback(() => {
        if (!timelineSelection) setTimelineSelection({ start: 0, end: Math.min(30, duration) })
    }, [timelineSelection, duration, setTimelineSelection])

    const clear = useCallback(() => setTimelineSelection(null), [setTimelineSelection])

    if (duration <= 0) return null

    return (
        <div className='rounded-lg border border-border bg-card px-3 py-2 space-y-2'>
            <div className='flex items-center justify-between'>
                <span className='text-xs font-medium text-foreground'>{t('attachments.selectSegment')}</span>
                {timelineSelection ? (
                    <button onClick={clear} className='text-[10px] text-muted-foreground hover:text-foreground'>
                        {t('attachments.clear')}
                    </button>
                ) : (
                    <button onClick={activate} className='text-[10px] text-primary hover:underline'>
                        {t('attachments.enable')}
                    </button>
                )}
            </div>

            {timelineSelection && (
                <>
                    <div className='relative h-2 rounded-full bg-muted'>
                        <div className='absolute h-full rounded-full bg-primary'
                            style={{ left: `${pct(start)}%`, width: `${pct(end) - pct(start)}%` }} />
                    </div>

                    <div className='flex items-center gap-2'>
                        <div className='flex-1 space-y-0.5'>
                            <label className='text-[10px] text-muted-foreground'>{t('attachments.start')}</label>
                            <input type='range' min={0} max={duration} step={0.5} value={start}
                                onChange={handleStartChange} className='w-full h-1 accent-primary' />
                            <span className='text-[10px] tabular-nums text-foreground'>{formatTime(start)}</span>
                        </div>
                        <div className='flex-1 space-y-0.5'>
                            <label className='text-[10px] text-muted-foreground'>{t('attachments.end')}</label>
                            <input type='range' min={0} max={duration} step={0.5} value={end}
                                onChange={handleEndChange} className='w-full h-1 accent-primary' />
                            <span className='text-[10px] tabular-nums text-foreground'>{formatTime(end)}</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
