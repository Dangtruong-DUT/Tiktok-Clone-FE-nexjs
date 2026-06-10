'use client'

import type { ComponentProps } from 'react'
import { useCallback } from 'react'
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom'
import { ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ConversationProps = ComponentProps<typeof StickToBottom>
export type ConversationContentProps = ComponentProps<typeof StickToBottom.Content>
export type ConversationScrollButtonProps = ComponentProps<typeof Button>

export function Conversation({ className, ...props }: ConversationProps) {
    return (
        <StickToBottom
            className={cn('relative flex-1 overflow-y-hidden', className)}
            initial='smooth'
            resize='smooth'
            role='log'
            {...props}
        />
    )
}

export function ConversationContent({ className, ...props }: ConversationContentProps) {
    return <StickToBottom.Content className={cn('flex flex-col gap-4 p-4', className)} {...props} />
}

export function ConversationScrollButton({ className, ...props }: ConversationScrollButtonProps) {
    const { isAtBottom, scrollToBottom } = useStickToBottomContext()

    const handleClick = useCallback(() => {
        scrollToBottom()
    }, [scrollToBottom])

    if (isAtBottom) return null

    return (
        <Button
            className={cn('absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full shadow-md', className)}
            onClick={handleClick}
            size='icon'
            type='button'
            variant='outline'
            {...props}
        >
            <ArrowDown className='size-4' />
        </Button>
    )
}
