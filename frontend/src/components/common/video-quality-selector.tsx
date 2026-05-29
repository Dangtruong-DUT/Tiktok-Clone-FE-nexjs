'use client'

import { Check, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HlsQualityLevel } from '@/hooks/video/useHlsPlayer'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

interface VideoQualitySelectorProps {
    levels: HlsQualityLevel[]
    currentLevel: number // -1 = auto
    onSelectLevel: (index: number) => void
    onSelectAuto: () => void
    className?: string
    side?: 'top' | 'bottom' | 'left' | 'right'
}

export function VideoQualitySelector({
    levels,
    currentLevel,
    onSelectLevel,
    onSelectAuto,
    className,
    side = 'top'
}: VideoQualitySelectorProps) {
    const currentLabel = currentLevel === -1 ? 'Auto' : (levels.find((l) => l.index === currentLevel)?.name ?? 'Auto')

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                        'flex items-center gap-1.5 text-white text-xs font-semibold bg-black/50 hover:bg-black/70 px-2 py-1 rounded-md transition-colors select-none outline-none',
                        className
                    )}
                    aria-label='Video quality'
                >
                    <Settings2 className='size-3.5' />
                    {currentLabel}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                side={side}
                align='end'
                sideOffset={8}
                onClick={(e) => e.stopPropagation()}
                className='bg-black/90 backdrop-blur-md border-white/10 text-white p-1 min-w-[148px] rounded-xl shadow-xl'
            >
                <DropdownMenuItem
                    onSelect={onSelectAuto}
                    className={cn(
                        'flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer focus:bg-white/10 focus:text-white',
                        currentLevel === -1 ? 'text-white' : 'text-white/50'
                    )}
                >
                    <span className='text-xs font-semibold'>Auto</span>
                    <div className='flex items-center gap-2'>
                        <span className='text-[10px] text-white/40'>ABR</span>
                        {currentLevel === -1 && <Check className='size-3 text-white' />}
                    </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator className='bg-white/10 my-1' />

                {[...levels].reverse().map((level) => {
                    const isSelected = currentLevel === level.index
                    return (
                        <DropdownMenuItem
                            key={level.index}
                            onSelect={() => onSelectLevel(level.index)}
                            className={cn(
                                'flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer focus:bg-white/10 focus:text-white',
                                isSelected ? 'text-white' : 'text-white/50'
                            )}
                        >
                            <span className='text-xs font-semibold'>{level.name}</span>
                            <div className='flex items-center gap-2'>
                                <span className='text-[10px] text-white/40'>{level.bitrateLabel}</span>
                                {isSelected && <Check className='size-3 text-white' />}
                            </div>
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
