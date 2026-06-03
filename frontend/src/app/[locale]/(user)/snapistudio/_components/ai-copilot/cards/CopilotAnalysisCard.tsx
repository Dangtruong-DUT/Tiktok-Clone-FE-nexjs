'use client'

import { cn } from '@/lib/utils'

interface CopilotAnalysisCardProps {
    content: string
    isStreaming?: boolean
    streamingContent?: string
    className?: string
}

export function CopilotAnalysisCard({
    content,
    isStreaming,
    streamingContent,
    className,
}: CopilotAnalysisCardProps) {
    const displayText = isStreaming ? (streamingContent ?? '') : content

    return (
        <div
            className={cn(
                'text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground',
                className,
            )}
        >
            {displayText}
            {isStreaming && (
                <span className='inline-block w-1 h-3.5 ml-0.5 bg-foreground/60 animate-pulse rounded-sm' />
            )}
        </div>
    )
}
