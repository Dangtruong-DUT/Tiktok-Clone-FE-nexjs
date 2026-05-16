'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import RichTextContent from '@/components/rich-text-content'
import type { MentionType } from '@/types/models/mention.model'
import type { HashtagType } from '@/types/models/hashtag.model'

interface ShowMoreProps {
    text: string
    mentions?: MentionType[]
    hashtags?: HashtagType[]
    maxHeight?: number
    className?: string
    textClassName?: string
    enableRichText?: boolean
    showMoreLabel?: string
    showLessLabel?: string
}

const ShowMore: React.FC<ShowMoreProps> = ({
    text,
    mentions,
    hashtags,
    maxHeight = 100,
    className,
    textClassName,
    enableRichText = false,
    showMoreLabel = 'more',
    showLessLabel = 'less'
}) => {
    const [expanded, setExpanded] = useState(false)
    const [showButton, setShowButton] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (contentRef.current) {
            setShowButton(contentRef.current.scrollHeight > maxHeight)
        }
    }, [text, maxHeight])

    return (
        <div className={cn('relative', className)}>
            <div
                ref={contentRef}
                style={{ maxHeight: expanded ? 'none' : `${maxHeight}px` }}
                className={cn('text-sm overflow-hidden transition-[max-height] duration-300 ease-in-out', textClassName)}
            >
                {enableRichText ? <RichTextContent text={text} mentions={mentions} hashtags={hashtags} /> : text}
            </div>

            {showButton && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className='mt-2 text-sm hover:underline cursor-pointer text-muted-foreground'
                >
                    {expanded ? showLessLabel : showMoreLabel}
                </button>
            )}
        </div>
    )
}

export default ShowMore
