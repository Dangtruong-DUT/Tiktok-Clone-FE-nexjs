'use client'
import React, { useState, useEffect, useRef, memo } from 'react'
import { cn } from '@/lib/utils'
import RichTextContent from '@/components/rich-text-content'
import type { MentionType } from '@/types/models/mention.model'
import type { HashtagType } from '@/types/models/hashtag.model'

interface VideoDescriptionProps {
    description: string
    mentions?: MentionType[]
    hashtags?: HashtagType[]
    className?: string
}

function VideoDescription({ description, mentions, hashtags, className }: VideoDescriptionProps) {
    const [expanded, setExpanded] = useState(false)
    const [canExpand, setCanExpand] = useState(false)
    const textRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const checkOverflow = () => {
            const el = textRef.current
            if (el) setCanExpand(el.scrollHeight > el.clientHeight)
        }
        checkOverflow()
        window.addEventListener('resize', checkOverflow)
        return () => window.removeEventListener('resize', checkOverflow)
    }, [description])

    return (
        <div className='relative w-full flex flex-row items-end justify-center'>
            <div
                ref={textRef}
                className={cn(
                    'text-sm leading-[18px] font-normal text-white whitespace-pre-wrap overflow-hidden flex-1',
                    '[-webkit-box-orient:vertical] [display:-webkit-box]',
                    expanded ? '[-webkit-line-clamp:unset]' : '[-webkit-line-clamp:1]',
                    className
                )}
            >
                <RichTextContent
                    text={description}
                    mentions={mentions}
                    hashtags={hashtags}
                    className='text-white'
                    mentionClassName='text-white underline'
                    hashtagClassName='text-white underline'
                />
            </div>

            {canExpand && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className='  text-sm font-semibold px-1.5 py-0.5 text-white hover:underline cursor-pointer'
                >
                    {expanded ? 'less' : 'more'}
                </button>
            )}
        </div>
    )
}

export default memo(VideoDescription)
