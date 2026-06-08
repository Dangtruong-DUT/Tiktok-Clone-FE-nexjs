import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
    icon?: ReactNode
    title?: string
    message: string
    action?: ReactNode
    className?: string
}

export function EmptyState({ icon, title, message, action, className }: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}>
            {icon && <div className='text-muted-foreground/50'>{icon}</div>}
            {title && <p className='text-sm font-semibold text-foreground'>{title}</p>}
            <p className='text-sm text-muted-foreground max-w-xs'>{message}</p>
            {action && <div className='mt-1'>{action}</div>}
        </div>
    )
}
