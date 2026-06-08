'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearStaleEncodings, isTerminalStatus } from '@/store/features/videoProcessingSlice'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Clapperboard } from 'lucide-react'
import { useEffect } from 'react'
import { EncodingTrackerItem } from './encoding-tracker-item'

export function EncodingTracker() {
    const dispatch = useAppDispatch()
    const tracked = useAppSelector((state) => state.videoProcessing.tracked)

    // Prune stale entries on mount
    useEffect(() => {
        dispatch(clearStaleEncodings())
    }, [dispatch])

    const activeCount = tracked.filter((e) => !isTerminalStatus(e.status)).length

    if (tracked.length === 0) return null

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant='ghost' size='icon' className='relative size-9'>
                    <Clapperboard className='size-4' />
                    {activeCount > 0 && (
                        <span className='absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white'>
                            {activeCount > 9 ? '9+' : activeCount}
                        </span>
                    )}
                    <span className='sr-only'>Encoding jobs</span>
                </Button>
            </PopoverTrigger>

            <PopoverContent align='end' className='w-80 p-0 shadow-lg'>
                {/* Header */}
                <div className='flex items-center justify-between border-b px-4 py-3'>
                    <div>
                        <p className='text-sm font-semibold'>Video Processing</p>
                        {activeCount > 0 ? (
                            <p className='text-xs text-muted-foreground'>
                                {activeCount} video{activeCount > 1 ? 's' : ''} encoding…
                            </p>
                        ) : (
                            <p className='text-xs text-muted-foreground'>All jobs finished</p>
                        )}
                    </div>
                </div>

                {/* Items */}
                <div className='flex flex-col gap-2 p-3 max-h-80 overflow-y-auto'>
                    {[...tracked].reverse().map((item) => (
                        <EncodingTrackerItem key={item.sessionUuid} item={item} />
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
