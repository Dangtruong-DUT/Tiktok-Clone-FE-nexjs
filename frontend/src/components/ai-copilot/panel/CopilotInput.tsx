'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Loader2, Scissors } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
    PromptInput,
    PromptInputTextarea,
    PromptInputFooter,
    PromptInputSubmit
} from '@/components/ai-elements/prompt-input'
import { useAiCopilotContext } from '../AiCopilotContext'

interface CopilotInputProps {
    onSend: (text: string) => void
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
    const [isCapturing, setIsCapturing] = useState(false)
    const { timelineSelection, setTimelineSelection, pendingMessage, setPendingMessage, clipAndSend } =
        useAiCopilotContext()

    // Stabilise onSend in a ref so the auto-send effect never re-fires
    // because the parent recreated the send callback (e.g. videoContext changed).
    const onSendRef = useRef(onSend)
    useEffect(() => {
        onSendRef.current = onSend
    }, [onSend])

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

    const handleTimelineChip = async (question: string) => {
        if (!clipAndSend || !timelineSelection || isCapturing || disabled) return
        setIsCapturing(true)
        await clipAndSend(timelineSelection.start, timelineSelection.end, question)
        setIsCapturing(false)
    }

    const timelineChips =
        timelineSelection && clipAndSend
            ? [
                  {
                      label: `${t('timeline.analyze')} ${formatTime(timelineSelection.start)}–${formatTime(timelineSelection.end)}`,
                      question: t('timeline.analyzeQuestion')
                  },
                  ...(timelineSelection.start < 10
                      ? [{ label: t('timeline.analyzeHook'), question: t('timeline.analyzeHookQuestion') }]
                      : []),
                  { label: t('timeline.analyzeContent'), question: t('timeline.analyzeContentQuestion') }
              ]
            : []

    return (
        <div className='px-3 pb-3 pt-2 shrink-0'>
            {/* Timeline selection badge */}
            {timelineSelection && (
                <div className='flex flex-col gap-2 mb-2'>
                    <div className='flex items-center gap-1.5 flex-wrap'>
                        <div
                            className='flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20
                                        text-primary px-2.5 py-0.5 text-[11px] font-medium'
                        >
                            <Scissors className='size-3' />
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

                    {/* Quick action chips for the selected segment */}
                    {timelineChips.length > 0 && (
                        <div className='flex flex-wrap gap-1.5'>
                            {timelineChips.map((chip) => (
                                <button
                                    key={chip.question}
                                    onClick={() => handleTimelineChip(chip.question)}
                                    disabled={isCapturing || disabled}
                                    className='flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5
                                               text-primary px-2.5 py-1 text-[11px] font-medium
                                               hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed
                                               transition-all active:scale-95'
                                >
                                    {isCapturing ? <Loader2 className='size-2.5 animate-spin' /> : null}
                                    {chip.label}
                                </button>
                            ))}
                        </div>
                    )}
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
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={t('input.placeholder')}
                    disabled={disabled}
                />
                <PromptInputFooter>
                    <span className='text-[10px] text-muted-foreground tabular-nums px-1'>{value.length}/2000</span>
                    <PromptInputSubmit disabled={disabled || !value.trim()} />
                </PromptInputFooter>
            </PromptInput>
        </div>
    )
}
