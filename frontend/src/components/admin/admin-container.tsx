'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AdminContainerProps {
    children: ReactNode
    className?: string
}
export function AdminContainer({ children, className }: AdminContainerProps) {
    return <div className={cn('mx-auto w-full max-w-[1600px] px-4 md:px-8 py-6 md:py-8', className)}>{children}</div>
}
