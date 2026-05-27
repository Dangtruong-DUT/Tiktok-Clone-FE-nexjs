'use client'

import { ReactNode } from 'react'
import LoadingIcon from '@/components/lottie-icons/loading'
import { cn } from '@/lib/utils'

interface TablePanelProps {
    toolbar?: ReactNode
    pagination?: ReactNode
    children: ReactNode
    isFetching?: boolean
    className?: string
    panelClassName?: string
}

export function TablePanel({ toolbar, pagination, children, isFetching, className, panelClassName }: TablePanelProps) {
    return (
        <div className={cn('flex flex-col gap-3', className)}>
            {toolbar && <div className='mb-1'>{toolbar}</div>}

            <div
                className={cn(
                    'relative border bg-background overflow-hidden transition-opacity duration-150',
                    panelClassName,
                    isFetching && 'opacity-40 pointer-events-none select-none'
                )}
            >
                {children}

                {isFetching && (
                    <div className='absolute inset-0 z-10 flex items-center justify-center'>
                        <div className='flex items-center gap-2 border border-border bg-background/90 px-3 py-1.5 backdrop-blur-sm'>
                            <LoadingIcon loop className='size-4' />
                            <span className='text-xs font-medium text-muted-foreground'>Loading…</span>
                        </div>
                    </div>
                )}
            </div>

            {pagination}
        </div>
    )
}
