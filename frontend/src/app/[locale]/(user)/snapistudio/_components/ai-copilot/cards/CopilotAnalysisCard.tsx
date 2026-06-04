'use client'

import { cn } from '@/lib/utils'
import { MarkdownText } from '@/components/ai-elements/markdown-text'

interface CopilotAnalysisCardProps {
    content: string
    isStreaming?: boolean
    streamingContent?: string
    className?: string
}

export function CopilotAnalysisCard({ content, isStreaming, streamingContent, className }: CopilotAnalysisCardProps) {
    const displayText = isStreaming ? (streamingContent ?? '') : content

    return (
        <div className={cn('min-w-0', className)}>
            <MarkdownText content={displayText} />
            {isStreaming && (
                <span className='inline-block w-1 h-3.5 ml-0.5 bg-foreground/50 animate-pulse rounded-sm' />
            )}
        </div>
    )
}
