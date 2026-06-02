'use client'

import type { ComponentProps, FormEvent, HTMLAttributes, PropsWithChildren, TextareaHTMLAttributes } from 'react'
import { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import { SendHorizonal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'


export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

interface SubmitMessage {
    text: string
}

interface PromptInputContextValue {
    value: string
    status: ChatStatus
    onSubmit: (msg: SubmitMessage) => void
}


const PromptInputContext = createContext<PromptInputContextValue | null>(null)

function usePromptInputContext() {
    const ctx = useContext(PromptInputContext)
    if (!ctx) throw new Error('PromptInput subcomponents must be used inside <PromptInput>')
    return ctx
}


interface PromptInputProps extends PropsWithChildren {
    value?: string
    onValueChange?: (v: string) => void
    status?: ChatStatus
    onSubmit: (msg: SubmitMessage) => void
    className?: string
}

export function PromptInput({
    value = '',
    onValueChange: _onValueChange,
    status = 'ready',
    onSubmit,
    children,
    className,
}: PromptInputProps) {
    const handleFormSubmit = useCallback(
        (e: FormEvent) => {
            e.preventDefault()
            if (value.trim() && status === 'ready') {
                onSubmit({ text: value.trim() })
            }
        },
        [value, status, onSubmit]
    )

    return (
        <PromptInputContext.Provider value={{ value, status, onSubmit }}>
            <form
                onSubmit={handleFormSubmit}
                className={cn('border-t border-border bg-background', className)}
            >
                {children}
            </form>
        </PromptInputContext.Provider>
    )
}


export type PromptInputTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function PromptInputTextarea({ className, onKeyDown, ...props }: PromptInputTextareaProps) {
    const { value, status, onSubmit } = usePromptInputContext()
    const ref = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    }, [props.value, value])

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey && status === 'ready') {
                const val = String(props.value ?? value ?? '').trim()
                if (val) {
                    e.preventDefault()
                    onSubmit({ text: val })
                }
            }
            onKeyDown?.(e)
        },
        [props.value, value, status, onSubmit, onKeyDown]
    )

    return (
        <textarea
            ref={ref}
            rows={1}
            className={cn(
                'w-full resize-none bg-transparent px-3 pt-3 pb-1 text-sm outline-none',
                'placeholder:text-muted-foreground max-h-[120px] min-h-[40px]',
                className
            )}
            onKeyDown={handleKeyDown}
            {...props}
        />
    )
}


export type PromptInputFooterProps = HTMLAttributes<HTMLDivElement>

export function PromptInputFooter({ className, ...props }: PromptInputFooterProps) {
    return <div className={cn('flex items-center justify-between px-2 py-1.5', className)} {...props} />
}


export type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>

export function PromptInputTools({ className, ...props }: PromptInputToolsProps) {
    return <div className={cn('flex items-center gap-1', className)} {...props} />
}


export type PromptInputButtonProps = ComponentProps<typeof Button>

export function PromptInputButton({ className, ...props }: PromptInputButtonProps) {
    return (
        <Button
            type='button'
            variant='ghost'
            size='icon'
            className={cn('size-8', className)}
            {...props}
        />
    )
}


interface PromptInputSubmitProps extends Omit<ComponentProps<typeof Button>, 'type'> {
    status?: ChatStatus
}

export function PromptInputSubmit({ status: externalStatus, className, disabled, ...props }: PromptInputSubmitProps) {
    const { value, status: ctxStatus } = usePromptInputContext()
    const status = externalStatus ?? ctxStatus
    const isDisabled = disabled ?? (!value.trim() || status !== 'ready')

    return (
        <Button
            type='submit'
            size='icon'
            aria-label='Gửi'
            className={cn('size-8 shrink-0', className)}
            disabled={isDisabled}
            {...props}
        >
            <SendHorizonal className='size-4' />
        </Button>
    )
}
