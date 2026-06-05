'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
    PromptInput,
    PromptInputTextarea,
    PromptInputFooter,
    PromptInputSubmit,
} from '@/components/ai-elements/prompt-input'
import { useAiCopilotContext } from '../AiCopilotContext'

interface CopilotInputProps {
    onSend:    (text: string) => void
    disabled?: boolean
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function CopilotInput({ onSend, disabled = false }: CopilotInputProps) {
    const t = useTranslations('SnapiStudio.aiCopilot')
    const [value, setValue] = useState('')
    const {
        timelineSelection, setTimelineSelection,
        pendingMessage, setPendingMessage,
    } = useAiCopilotContext()

    // Stabilise onSend in a ref so the auto-send effect never re-fires
    // because the parent recreated the send callback (e.g. videoContext changed).
    const onSendRef = useRef(onSend)
    useEffect(() => { onSendRef.current = onSend }, [onSend])

    // Auto-send when the timeline "Analyze With AI" triggers a pending message.
    // Clear pendingMessage BEFORE calling send to prevent double-trigger.
    useEffect(() => {
        if (!pendingMessage || disabled) return
        const msg = pendingMessage
        setPendingMessage(null)
        onSendRef.current(msg)
    }, [pendingMessage, disabled, setPendingMessage])

    const handleSubmit = ({ text }: { text: string }) => {
        if (!text.trim() || disabled) return
        onSend(text.trim())
        setValue('')
    }

    return (
        <div className='px-3 pb-3 pt-2 shrink-0'>
            {/* Timeline selection badge */}
            {timelineSelection && (
                <div className='flex items-center gap-1.5 mb-2'>
                    <div className='flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20
                                    text-primary px-2.5 py-0.5 text-[11px] font-medium'>
                        <span>
                            {formatTime(timelineSelection.start)} – {formatTime(timelineSelection.end)}
                        </span>
                        <button
                            onClick={() => setTimelineSelection(null)}
                            className='ml-0.5 hover:opacity-70 transition-opacity'
                        >
                            <X className='size-3' />
                        </button>
                    </div>
                </div>
            )}

            {/* blocks.so-style input box */}
            <PromptInput
                value={value}
                onValueChange={setValue}
                status={disabled ? 'submitted' : 'ready'}
                onSubmit={handleSubmit}
            >
                <PromptInputTextarea
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder={t('input.placeholder')}
                    disabled={disabled}
                />
                <PromptInputFooter>
                    <span className='text-[10px] text-muted-foreground tabular-nums px-1'>
                        {value.length}/2000
                    </span>
                    <PromptInputSubmit disabled={disabled || !value.trim()} />
                </PromptInputFooter>
            </PromptInput>
        </div>
    )
}
