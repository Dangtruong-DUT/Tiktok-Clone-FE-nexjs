'use client'

import { useState } from 'react'
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
    onSend: (text: string) => void
    disabled?: boolean
}

export function CopilotInput({ onSend, disabled = false }: CopilotInputProps) {
    const t = useTranslations('SnapiStudio.aiCopilot')
    const [value, setValue] = useState('')
    const { selectedFrames, setSelectedFrames, timelineSelection, setTimelineSelection } =
        useAiCopilotContext()

    const handleSubmit = ({ text }: { text: string }) => {
        if (!text.trim() || disabled) return
        onSend(text.trim())
        setValue('')
    }

    return (
        <div className='border-t border-border'>
            {/* Frame preview strip */}
            {selectedFrames.length > 0 && (
                <div className='flex gap-1.5 px-3 pt-2 flex-wrap'>
                    {selectedFrames.map((frame, i) => (
                        <div key={i} className='relative group'>
                            <img
                                src={frame}
                                alt={`Frame ${i + 1}`}
                                className='h-12 w-12 rounded-md object-cover border border-border'
                            />
                            <button
                                onClick={() =>
                                    setSelectedFrames(selectedFrames.filter((_, idx) => idx !== i))
                                }
                                className='absolute -top-1 -right-1 hidden group-hover:flex items-center justify-center
                                           size-4 rounded-full bg-destructive text-destructive-foreground'
                            >
                                <X className='size-2.5' />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Timeline selection badge */}
            {timelineSelection && (
                <div className='flex items-center gap-1.5 px-3 pt-1.5'>
                    <div className='flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs'>
                        <span>
                            {formatTime(timelineSelection.start)} – {formatTime(timelineSelection.end)}
                        </span>
                        <button onClick={() => setTimelineSelection(null)} className='ml-0.5 hover:opacity-70'>
                            <X className='size-3' />
                        </button>
                    </div>
                </div>
            )}

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
                    <span className='text-[10px] text-muted-foreground'>
                        {value.length}/2000
                    </span>
                    <PromptInputSubmit disabled={disabled || !value.trim()} />
                </PromptInputFooter>
            </PromptInput>
        </div>
    )
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
