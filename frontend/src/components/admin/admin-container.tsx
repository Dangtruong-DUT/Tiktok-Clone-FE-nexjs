import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AdminContainerProps {
    children: ReactNode
    className?: string
}

export function AdminContainer({ children, className }: AdminContainerProps) {
    return <div className={cn('px-4 md:px-6 py-6', className)}>{children}</div>
}
