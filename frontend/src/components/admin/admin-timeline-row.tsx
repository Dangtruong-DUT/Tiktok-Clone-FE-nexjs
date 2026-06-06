import { type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminTimelineRowProps {
    icon: LucideIcon
    iconClassName: string
    isLast?: boolean
    children: ReactNode
    timeAgo: string
    timestamp?: string
    onClick?: () => void
}

export function AdminTimelineRow({
    icon: Icon,
    iconClassName,
    isLast = false,
    children,
    timeAgo,
    timestamp,
    onClick
}: AdminTimelineRowProps) {
    return (
        <div className='flex items-stretch gap-3'>
            {/* Timeline column */}
            <div className='flex flex-col items-center shrink-0'>
                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', iconClassName)}>
                    <Icon className='h-3.5 w-3.5' />
                </div>
                {!isLast && <div className='mt-1 w-px flex-1 bg-border' />}
            </div>

            {/* Content */}
            <div
                className={cn(
                    'flex-1 flex items-start justify-between gap-4 rounded-lg border border-border bg-card px-3.5 py-2.5 transition-colors',
                    !isLast && 'mb-2',
                    onClick && 'cursor-pointer hover:bg-muted/40'
                )}
                onClick={onClick}
                title={timestamp}
            >
                <div className='min-w-0 flex-1 text-sm text-foreground leading-snug'>{children}</div>
                <span className='shrink-0 text-xs text-muted-foreground whitespace-nowrap pt-0.5'>{timeAgo}</span>
            </div>
        </div>
    )
}
