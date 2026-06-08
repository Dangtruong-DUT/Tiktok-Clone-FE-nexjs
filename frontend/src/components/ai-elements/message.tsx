'use client'

import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'


type MessageRole = 'user' | 'assistant'

export interface MessageProps extends HTMLAttributes<HTMLDivElement> {
    from: MessageRole
}

export type MessageContentProps = HTMLAttributes<HTMLDivElement>


export function Message({ className, from, ...props }: MessageProps) {
    return (
        <div
            className={cn(
                'flex w-full max-w-[92%] flex-col gap-1.5',
                from === 'user' ? 'ml-auto items-end' : 'items-start',
                className
            )}
            {...props}
        />
    )
}

export function MessageContent({ children, className, ...props }: MessageContentProps) {
    return (
        <div
            className={cn(
                'flex min-w-0 max-w-full flex-col gap-2 overflow-hidden text-sm',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
