'use client'

import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { useSearchHashtagsInfiniteQuery, useSearchUsersInfiniteQuery } from '@/store/services/search.service'
import useDebounce from '@/hooks/shared/useDebounce'
import { useMemo, useRef, useState } from 'react'
import type { UserType } from '@/types/models/user.model'
import type { HashtagType } from '@/types/models/hashtag.model'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ACTIVE_SOCIAL_TOKEN_REGEX } from '@/constants/regex'
import { Loader2 } from 'lucide-react'

type TriggerType = '@' | '#'

type ActiveTokenType = {
    trigger: TriggerType
    query: string
    start: number
    end: number
}

interface MentionHashtagTextFieldProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    wrapperClassName?: string
    rows?: number
    as?: 'textarea' | 'input'
    disabled?: boolean
    autoComplete?: string
    spellCheck?: boolean
    suggestionPlacement?: 'top' | 'bottom'
}

const findActiveToken = (value: string, caretPosition: number): ActiveTokenType | null => {
    const beforeCaret = value.slice(0, caretPosition)
    const match = beforeCaret.match(ACTIVE_SOCIAL_TOKEN_REGEX)

    if (!match) return null

    const trigger = match[2] as TriggerType
    const query = match[3] ?? ''
    const start = caretPosition - query.length - 1

    return {
        trigger,
        query,
        start,
        end: caretPosition
    }
}

export default function MentionHashtagTextField({
    value,
    onChange,
    placeholder,
    className,
    wrapperClassName,
    rows = 4,
    as = 'textarea',
    disabled,
    autoComplete = 'off',
    spellCheck = false,
    suggestionPlacement = 'bottom'
}: MentionHashtagTextFieldProps) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [activeIndex, setActiveIndex] = useState(0)

    const activeInputRef = as === 'textarea' ? textareaRef : inputRef
    const caretPosition = activeInputRef.current?.selectionStart ?? value.length
    const activeToken = findActiveToken(value, caretPosition)

    const debouncedQuery = useDebounce(activeToken?.query ?? '', 250)

    const shouldSearchUsers = activeToken?.trigger === '@' && debouncedQuery.length > 0
    const shouldSearchHashtags = activeToken?.trigger === '#' && debouncedQuery.length > 0

    const {
        data: usersRes,
        fetchNextPage: fetchNextUsersPage,
        hasNextPage: hasNextUsersPage,
        isFetchingNextPage: isFetchingNextUsersPage
    } = useSearchUsersInfiniteQuery(
        { q: debouncedQuery },
        {
            skip: !shouldSearchUsers
        }
    )

    const {
        data: hashtagsRes,
        fetchNextPage: fetchNextHashtagsPage,
        hasNextPage: hasNextHashtagsPage,
        isFetchingNextPage: isFetchingNextHashtagsPage
    } = useSearchHashtagsInfiniteQuery(
        { q: debouncedQuery },
        {
            skip: !shouldSearchHashtags
        }
    )

    const users = (usersRes?.pages.flatMap((page) => page.data) ?? []) as UserType[]
    const hashtags = (hashtagsRes?.pages.flatMap((page) => page.data) ?? []) as HashtagType[]

    const suggestions = useMemo(() => {
        if (!activeToken) return []

        if (activeToken.trigger === '@') {
            return users.map((user) => ({
                key: `user-${user.id}`,
                type: 'user' as const,
                label: user.username,
                subLabel: user.name,
                avatar: user.avatar,
                value: `@${user.username}`
            }))
        }

        return hashtags.map((hashtag) => ({
            key: `hashtag-${hashtag.id}`,
            type: 'hashtag' as const,
            label: `#${hashtag.name}`,
            subLabel: `${hashtag.name}`,
            value: `#${hashtag.name}`
        }))
    }, [activeToken, hashtags, users])

    const isOpen = !!activeToken && suggestions.length > 0

    const hasNextPage = activeToken?.trigger === '@' ? !!hasNextUsersPage : !!hasNextHashtagsPage
    const isFetchingNextPage = activeToken?.trigger === '@' ? isFetchingNextUsersPage : isFetchingNextHashtagsPage

    const handleFetchNextPage = () => {
        if (!activeToken || !hasNextPage || isFetchingNextPage) return

        if (activeToken.trigger === '@') {
            fetchNextUsersPage()
            return
        }

        fetchNextHashtagsPage()
    }

    const selectSuggestion = (insertValue: string) => {
        if (!activeToken) return

        const nextValue = `${value.slice(0, activeToken.start)}${insertValue} ${value.slice(activeToken.end)}`
        const nextCaret = activeToken.start + insertValue.length + 1

        onChange(nextValue)
        setActiveIndex(0)

        requestAnimationFrame(() => {
            activeInputRef.current?.focus()
            activeInputRef.current?.setSelectionRange(nextCaret, nextCaret)
        })
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (!isOpen) return

        if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActiveIndex((prev) => (prev + 1) % suggestions.length)
            return
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
            return
        }

        if (event.key === 'Enter') {
            event.preventDefault()
            const selected = suggestions[activeIndex]
            if (selected) selectSuggestion(selected.value)
            return
        }

        if (event.key === 'Escape') {
            event.preventDefault()
            setActiveIndex(0)
        }
    }

    const handleSuggestionScroll = (event: React.UIEvent<HTMLUListElement>) => {
        const target = event.currentTarget
        const remaining = target.scrollHeight - target.scrollTop - target.clientHeight

        if (remaining <= 24) {
            handleFetchNextPage()
        }
    }

    return (
        <div className={cn('relative', wrapperClassName)}>
            {as === 'textarea' ? (
                <Textarea
                    ref={textareaRef}
                    rows={rows}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={className}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    spellCheck={spellCheck}
                />
            ) : (
                <input
                    ref={inputRef}
                    type='text'
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={className}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    spellCheck={spellCheck}
                />
            )}

            {isOpen && (
                <div
                    className={cn(
                        'absolute z-[1200] w-full max-w-[320px] overflow-hidden rounded-xl border border-border/50 bg-popover/95 backdrop-blur-md p-1 shadow-xl duration-300 [animation-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] animate-in fade-in zoom-in-95',
                        suggestionPlacement === 'top' ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+4px)]'
                    )}
                >
                    <ul className='max-h-44 overflow-auto' onScroll={handleSuggestionScroll}>
                        {suggestions.map((item, index) => (
                            <li key={item.key}>
                                <button
                                    type='button'
                                    className={cn(
                                        'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-accent cursor-pointer transition-colors',
                                        index === activeIndex && 'bg-accent'
                                    )}
                                    onMouseDown={(event) => {
                                        event.preventDefault()
                                        selectSuggestion(item.value)
                                    }}
                                >
                                    {item.type === 'user' ? (
                                        <Avatar className='size-6'>
                                            <AvatarImage
                                                src={item.avatar || undefined}
                                                alt={item.label}
                                                className='object-cover'
                                            />
                                            <AvatarFallback>{item.label.slice(0, 1).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    ) : (
                                        <div className='flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold'>
                                            #
                                        </div>
                                    )}

                                    <div className='flex flex-col overflow-hidden'>
                                        <span className='truncate text-sm leading-tight font-medium'>{item.label}</span>
                                        <span className='truncate text-[11px] leading-tight text-muted-foreground'>
                                            {item.subLabel}
                                        </span>
                                    </div>
                                </button>
                            </li>
                        ))}

                        {isFetchingNextPage && (
                            <li className='flex items-center justify-center py-2 text-muted-foreground'>
                                <Loader2 className='size-4 animate-spin' />
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    )
}
