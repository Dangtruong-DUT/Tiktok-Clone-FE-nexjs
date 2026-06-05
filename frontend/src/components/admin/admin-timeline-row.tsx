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
    onClick,
}: AdminTimelineRowProps) {
    return (
        <div
            className={cn(
                'flex items-start gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors',
                onClick && 'cursor-pointer hover:bg-muted/40'
            )}
            onClick={onClick}
            title={timestamp}
        >
            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', iconClassName)}>
                <Icon className='h-3.5 w-3.5' />
            </div>

            <div className='min-w-0 flex-1'>
                <div className='text-sm text-foreground leading-snug'>{children}</div>
            </div>

            <span className='shrink-0 text-xs text-muted-foreground whitespace-nowrap'>{timeAgo}</span>
        </div>
    )
}
