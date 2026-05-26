'use client'

import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
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
            <div
                className={cn(
                    'relative rounded-lg border bg-card shadow-xs overflow-hidden transition-opacity duration-150',
                    panelClassName,
                    isFetching && 'opacity-40 pointer-events-none select-none'
                )}
            >
                {toolbar && <div className='border-b border-border/60'>{toolbar}</div>}

                {children}

                {isFetching && (
                    <div className='absolute inset-0 z-10 flex items-center justify-center'>
                        <div className='flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 shadow-sm backdrop-blur-sm'>
                            <Loader2 className='h-3.5 w-3.5 animate-spin text-primary' />
                            <span className='text-xs font-medium text-muted-foreground'>Loading…</span>
                        </div>
                    </div>
                )}
            </div>

            {pagination}
        </div>
    )
}
