'use client'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { Fragment } from 'react'
import { HASHTAG_EXACT_REGEX, SOCIAL_SPLIT_REGEX, USERNAME_EXACT_REGEX } from '@/constants/regex'
import type { MentionType } from '@/types/models/mention.model'
import type { HashtagType } from '@/types/models/hashtag.model'
import { APP_ROUTES, USER_ROUTES } from '@/constants/routes/routes'

interface RichTextContentProps {
    text: string
    mentions?: MentionType[]
    hashtags?: HashtagType[]
    className?: string
    mentionClassName?: string
    hashtagClassName?: string
}

type PositionedToken =
    | { type: 'mention'; start: number; end: number; username: string }
    | { type: 'hashtag'; start: number; end: number; name: string }

export default function RichTextContent({
    text,
    mentions,
    hashtags,
    className,
    mentionClassName,
    hashtagClassName
}: RichTextContentProps) {
    const hasStructuredMetadata = mentions !== undefined || hashtags !== undefined

    const positionedTokens: PositionedToken[] = [
        ...(mentions ?? [])
            .filter((item): item is MentionType & { start: number; end: number } => {
                return typeof item.start === 'number' && typeof item.end === 'number' && item.start < item.end
            })
            .map((item) => ({
                type: 'mention' as const,
                start: item.start,
                end: item.end,
                username: item.username
            })),
        ...(hashtags ?? [])
            .filter((item): item is HashtagType & { start: number; end: number } => {
                return typeof item.start === 'number' && typeof item.end === 'number' && item.start < item.end
            })
            .map((item) => ({
                type: 'hashtag' as const,
                start: item.start,
                end: item.end,
                name: item.name
            }))
    ].sort((a, b) => a.start - b.start || a.end - b.end)

    if (hasStructuredMetadata) {
        const rendered: React.ReactNode[] = []
        let cursor = 0

        for (const token of positionedTokens) {
            if (token.start < cursor || token.start < 0 || token.end > text.length) {
                continue
            }

            if (token.start > cursor) {
                rendered.push(<Fragment key={`plain-${cursor}`}>{text.slice(cursor, token.start)}</Fragment>)
            }

            const tokenText = text.slice(token.start, token.end)

            if (token.type === 'mention') {
                rendered.push(
                    <Link
                        key={`mention-${token.start}-${token.end}`}
                        href={USER_ROUTES.PROFILE(token.username)}
                        className={cn('text-brand hover:underline', mentionClassName)}
                    >
                        {tokenText || `@${token.username}`}
                    </Link>
                )
            }

            if (token.type === 'hashtag') {
                const hashtagText = tokenText || `#${token.name}`

                rendered.push(
                    <Link
                        key={`hashtag-${token.start}-${token.end}`}
                        href={`${APP_ROUTES.SEARCH}?q=${encodeURIComponent(hashtagText)}`}
                        className={cn('text-brand hover:underline', hashtagClassName)}
                    >
                        {hashtagText}
                    </Link>
                )
            }

            cursor = token.end
        }

        if (cursor < text.length) {
            rendered.push(<Fragment key={`plain-${cursor}-tail`}>{text.slice(cursor)}</Fragment>)
        }

        return <span className={cn('whitespace-pre-wrap break-words', className)}>{rendered}</span>
    }

    const chunks = text.split(SOCIAL_SPLIT_REGEX)

    return (
        <span className={cn('whitespace-pre-wrap break-words', className)}>
            {chunks.map((chunk, index) => {
                if (!chunk) return null

                if (chunk.startsWith('@') && USERNAME_EXACT_REGEX.test(chunk.slice(1))) {
                    const username = chunk.slice(1)
                    return (
                        <Link
                            key={`${chunk}-${index}`}
                            href={USER_ROUTES.PROFILE(username)}
                            className={cn('text-brand hover:underline', mentionClassName)}
                        >
                            {chunk}
                        </Link>
                    )
                }

                if (chunk.startsWith('#') && HASHTAG_EXACT_REGEX.test(chunk.slice(1))) {
                    return (
                        <Link
                            key={`${chunk}-${index}`}
                            href={`${APP_ROUTES.SEARCH}?q=${encodeURIComponent(chunk)}`}
                            className={cn('text-brand hover:underline', hashtagClassName)}
                        >
                            {chunk}
                        </Link>
                    )
                }

                return <Fragment key={`${chunk}-${index}`}>{chunk}</Fragment>
            })}
        </span>
    )
}
