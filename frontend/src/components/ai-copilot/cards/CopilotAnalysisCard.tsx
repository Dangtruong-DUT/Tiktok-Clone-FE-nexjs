'use client'

import { cn } from '@/lib/utils'
import { MarkdownText } from '@/components/ai-elements/markdown-text'
import { BOUNCE_DOT_INDEXES } from '@/constants/ai/copilot'

interface CopilotAnalysisCardProps {
    content: string
    isStreaming?: boolean
    streamingContent?: string
    className?: string
}

export function CopilotAnalysisCard({ content, isStreaming, streamingContent, className }: CopilotAnalysisCardProps) {
    const displayText = isStreaming ? (streamingContent ?? '') : content
    const isWaiting   = isStreaming && !displayText

    return (
        <div className={cn('min-w-0', className)}>
            {isWaiting ? (
                <div className='inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-muted'>
                    {BOUNCE_DOT_INDEXES.map(i => (
                        <span
                            key={i}
                            className='size-1.5 rounded-full bg-muted-foreground/70 animate-bounce'
                            style={{ animationDelay: `${i * 150}ms` }}
                        />
                    ))}
                </div>
            ) : (
                <div className='rounded-2xl rounded-tl-sm bg-muted/60 px-3.5 py-2.5'>
                    <MarkdownText content={displayText} />
                    {isStreaming && (
                        <span className='inline-block w-1 h-3.5 ml-0.5 bg-foreground/50 animate-pulse rounded-sm' />
                    )}
                </div>
            )}
        </div>
    )
}
