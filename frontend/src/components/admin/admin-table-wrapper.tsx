'use client'

import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminTableWrapperProps {
    isFetching?: boolean
    children: ReactNode
    className?: string
}

export function AdminTableWrapper({ isFetching, children, className }: AdminTableWrapperProps) {
    return (
        <div className={cn('relative', className)}>
            <div className={cn('transition-opacity duration-200', isFetching && 'opacity-50 pointer-events-none select-none')}>
                {children}
            </div>
            {isFetching && (
                <div className='absolute inset-0 z-10 flex items-center justify-center'>
                    <div className='flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-md'>
                        <Loader2 className='h-4 w-4 animate-spin text-brand' />
                        <span className='text-xs font-medium text-muted-foreground'>Loading…</span>
                    </div>
                </div>
            )}
        </div>
    )
}
