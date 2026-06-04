'use client'

import { useEffect, useRef } from 'react'
import { Bot } from 'lucide-react'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { CopilotContentCard } from '../cards/CopilotContentCard'
import { CopilotAnalysisCard } from '../cards/CopilotAnalysisCard'
import { CopilotScheduleCard } from '../cards/CopilotScheduleCard'
import { CopilotSuggestions } from './CopilotSuggestions'
import type { AiCopilotMessage, AiCopilotScheduleOutput, AiCopilotStructuredOutput } from '@/types/models/ai-copilot.model'
import { AI_COPILOT_OUTPUT_TYPES, AI_COPILOT_ROLES, BOUNCE_DOT_INDEXES } from '@/constants/ai/copilot'

interface CopilotMessagesProps {
    messages:         AiCopilotMessage[]
    isSending:        boolean
    onAccept:         (messageUuid: string, field: string, value: string) => void
    onReject:         (messageUuid: string) => void
    onScheduleAccept: (messageUuid: string) => void
    onChipSelect:     (text: string) => void
}

export function CopilotMessages({
    messages, isSending, onAccept, onReject, onScheduleAccept, onChipSelect,
}: CopilotMessagesProps) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    return (
        <div className='flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-hidden'>
            {messages.map((msg, idx) => {
                if (msg.role === AI_COPILOT_ROLES.SYSTEM) {
                    return (
                        <div key={msg.uuid} className='text-center text-xs text-muted-foreground py-1'>
                            {msg.content}
                        </div>
                    )
                }

                const isLast = idx === messages.length - 1
                const chips  = isLast && msg.role === AI_COPILOT_ROLES.ASSISTANT ? (msg.follow_up_chips ?? []) : []

                if (msg.role === AI_COPILOT_ROLES.USER) {
                    return (
                        <div key={msg.uuid}>
                            <Message from='user'>
                                <MessageContent className='rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-3.5 py-2.5'>
                                    <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>
                                        {msg.content}
                                    </p>
                                </MessageContent>
                            </Message>
                        </div>
                    )
                }

                return (
                    <div key={msg.uuid} className='space-y-2'>
                        <div className='flex items-start gap-2'>
                            <div className='mt-0.5 shrink-0 size-6 rounded-full bg-primary/10 border border-primary/20
                                            flex items-center justify-center'>
                                <Bot className='size-3.5 text-primary' />
                            </div>

                            <div className='flex-1 min-w-0 space-y-1.5'>
                                {msg.structured_output?.type === AI_COPILOT_OUTPUT_TYPES.SCHEDULE_CARD ? (
                                    <>
                                        <p className='text-sm text-foreground'>{msg.content}</p>
                                        <CopilotScheduleCard
                                            messageUuid={msg.uuid}
                                            output={msg.structured_output as AiCopilotScheduleOutput}
                                            status={msg.status}
                                            onAccept={onScheduleAccept}
                                            onReject={onReject}
                                        />
                                    </>
                                ) : msg.structured_output?.type === AI_COPILOT_OUTPUT_TYPES.CONTENT_CARD ? (
                                    <>
                                        <p className='text-sm text-foreground'>{msg.content}</p>
                                        <CopilotContentCard
                                            messageUuid={msg.uuid}
                                            output={msg.structured_output as AiCopilotStructuredOutput}
                                            status={msg.status}
                                            onAccept={onAccept}
                                            onReject={onReject}
                                        />
                                    </>
                                ) : (
                                    <CopilotAnalysisCard
                                        content={msg.content}
                                        isStreaming={msg.isStreaming}
                                        streamingContent={msg.streamingContent}
                                    />
                                )}
                            </div>
                        </div>

                        {chips.length > 0 && (
                            <div className='pl-8'>
                                <CopilotSuggestions chips={chips} onSelect={onChipSelect} />
                            </div>
                        )}
                    </div>
                )
            })}
            {isSending && messages[messages.length - 1]?.role === AI_COPILOT_ROLES.USER && (
                <div className='flex items-start gap-2'>
                    <div className='mt-0.5 shrink-0 size-6 rounded-full bg-primary/10 border border-primary/20
                                    flex items-center justify-center'>
                        <Bot className='size-3.5 text-primary' />
                    </div>
                    <div className='inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-muted'>
                        {BOUNCE_DOT_INDEXES.map(i => (
                            <span
                                key={i}
                                className='size-1.5 rounded-full bg-muted-foreground/70 animate-bounce'
                                style={{ animationDelay: `${i * 150}ms` }}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    )
}
