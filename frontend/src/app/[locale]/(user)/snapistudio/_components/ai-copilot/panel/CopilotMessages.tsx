'use client'

import { useEffect, useRef } from 'react'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { CopilotContentCard } from '../cards/CopilotContentCard'
import { CopilotAnalysisCard } from '../cards/CopilotAnalysisCard'
import { CopilotScheduleCard } from '../cards/CopilotScheduleCard'
import { CopilotSuggestions } from './CopilotSuggestions'
import type { AiCopilotMessage, AiCopilotScheduleOutput, AiCopilotStructuredOutput } from '@/types/models/ai-copilot.model'

interface CopilotMessagesProps {
    messages: AiCopilotMessage[]
    onAccept: (messageUuid: string, field: string, value: string) => void
    onReject: (messageUuid: string) => void
    onScheduleAccept: (messageUuid: string) => void
    onChipSelect: (text: string) => void
}

export function CopilotMessages({
    messages,
    onAccept,
    onReject,
    onScheduleAccept,
    onChipSelect,
}: CopilotMessagesProps) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    return (
        <div className='flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-hidden'>
            {messages.map((msg, idx) => {
                if (msg.role === 'system') {
                    return (
                        <div key={msg.uuid} className='text-center text-xs text-muted-foreground py-1'>
                            {msg.content}
                        </div>
                    )
                }

                const isLast = idx === messages.length - 1
                const chips  = isLast && msg.role === 'assistant' ? (msg.follow_up_chips ?? []) : []

                return (
                    <div key={msg.uuid}>
                        <Message from={msg.role === 'user' ? 'user' : 'assistant'}>
                            <MessageContent
                                className={
                                    msg.role === 'user'
                                        ? 'rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-3 py-2'
                                        : 'rounded-2xl rounded-tl-sm bg-muted px-3 py-2'
                                }
                            >
                                {msg.role === 'assistant' && msg.structured_output?.type === 'schedule_card' ? (
                                    <>
                                        <p className='text-sm'>{msg.content}</p>
                                        <CopilotScheduleCard
                                            messageUuid={msg.uuid}
                                            output={msg.structured_output as AiCopilotScheduleOutput}
                                            status={msg.status}
                                            onAccept={onScheduleAccept}
                                            onReject={onReject}
                                        />
                                    </>
                                ) : msg.role === 'assistant' && msg.structured_output?.type === 'content_card' ? (
                                    <>
                                        <p className='text-sm'>{msg.content}</p>
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
                            </MessageContent>
                        </Message>

                        {chips.length > 0 && (
                            <div className='-mx-3'>
                                <CopilotSuggestions chips={chips} onSelect={onChipSelect} />
                            </div>
                        )}
                    </div>
                )
            })}
            <div ref={bottomRef} />
        </div>
    )
}
