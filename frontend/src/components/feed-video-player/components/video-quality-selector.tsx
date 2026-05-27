'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { HlsQualityLevel } from '@/hooks/video/useHlsPlayer'

interface VideoQualitySelectorProps {
    levels: HlsQualityLevel[]
    currentLevel: number // -1 = auto
    onSelectLevel: (index: number) => void
    onSelectAuto: () => void
    className?: string
}

export function VideoQualitySelector({
    levels,
    currentLevel,
    onSelectLevel,
    onSelectAuto,
    className,
}: VideoQualitySelectorProps) {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const currentLabel =
        currentLevel === -1 ? 'Auto' : (levels.find((l) => l.index === currentLevel)?.name ?? 'Auto')

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    setOpen((v) => !v)
                }}
                className='text-white text-xs font-semibold bg-black/50 hover:bg-black/70 px-2 py-1 rounded-md transition-colors select-none'
                aria-label='Video quality'
            >
                {currentLabel}
            </button>

            {open && (
                <div className='absolute bottom-full right-0 mb-1.5 bg-black/85 backdrop-blur-sm rounded-xl overflow-hidden min-w-[76px] z-50 shadow-xl'>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onSelectAuto()
                            setOpen(false)
                        }}
                        className={cn(
                            'block w-full text-right px-3 py-2 text-xs hover:bg-white/10 transition-colors',
                            currentLevel === -1 ? 'text-primary font-bold' : 'text-white'
                        )}
                    >
                        Auto
                    </button>

                    {[...levels].reverse().map((level) => (
                        <button
                            key={level.index}
                            onClick={(e) => {
                                e.stopPropagation()
                                onSelectLevel(level.index)
                                setOpen(false)
                            }}
                            className={cn(
                                'block w-full text-right px-3 py-2 text-xs hover:bg-white/10 transition-colors',
                                currentLevel === level.index ? 'text-primary font-bold' : 'text-white'
                            )}
                        >
                            {level.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
