'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AdminContainerProps {
    children: ReactNode
    className?: string
}

/**
 * AdminContainer - Content wrapper with proper spacing
 */
export function AdminContainer({ children, className }: AdminContainerProps) {
    return <div className={cn('px-4 md:px-8 py-6 md:py-8', className)}>{children}</div>
}
