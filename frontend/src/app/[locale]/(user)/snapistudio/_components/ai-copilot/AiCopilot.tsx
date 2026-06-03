'use client'

import { useEffect, useState } from 'react'
import { Bot, Minus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useAiCopilotContext } from './AiCopilotContext'
import { useCopilotSession } from './hooks/useCopilotSession'
import { useAiCopilot } from './hooks/useAiCopilot'
import { CopilotMessages } from './panel/CopilotMessages'
import { CopilotInput } from './panel/CopilotInput'

export function AiCopilot() {
    const t = useTranslations('SnapiStudio.aiCopilot')
    const { isPanelOpen, openPanel, closePanel, videoContext } = useAiCopilotContext()
    const [isMinimised, setIsMinimised] = useState(false)

    const { session, sessionUuid, isLoading: isSessionLoading, start } = useCopilotSession()
    const { messages, isSending, send, accept, reject, initFromSession } = useAiCopilot({ sessionUuid })

    useEffect(() => {
        if (isPanelOpen && !sessionUuid) {
            start({ upload_session_uuid: videoContext.upload_session_uuid })
        }
    }, [isPanelOpen, sessionUuid, start, videoContext])

    useEffect(() => {
        if (session?.messages?.length) initFromSession(session.messages)
    }, [session, initFromSession])

    const displayMessages = messages.length === 0 && !isSessionLoading ? [] : messages
    const quickPrompts    = t.raw('quickPrompts') as string[]

    return (
        <>
            {/* FAB */}
            {!isPanelOpen && (
                <button
                    onClick={openPanel}
                    className='fixed bottom-6 right-6 z-50 flex items-center justify-center
                               size-14 rounded-full bg-primary text-primary-foreground shadow-lg
                               hover:bg-primary/90 transition-all hover:scale-105 active:scale-95'
                    aria-label={t('title')}
                >
                    <Bot className='size-6' />
                </button>
            )}

            {/* Panel */}
            {isPanelOpen && (
                <div className={cn(
                    'fixed bottom-6 right-6 z-50 flex flex-col',
                    'w-[420px] rounded-2xl border border-border bg-background shadow-2xl transition-all duration-200',
                    isMinimised ? 'h-12 overflow-hidden' : 'h-[620px]',
                )}>
                    {/* Header */}
                    <div className='flex items-center justify-between px-4 py-3 border-b border-border shrink-0'>
                        <div className='flex items-center gap-2'>
                            <Bot className='size-4 text-primary' />
                            <span className='text-sm font-semibold'>{t('title')}</span>
                            {isSending && (
                                <span className='flex items-center gap-1 text-[10px] text-muted-foreground'>
                                    <span className='size-1.5 rounded-full bg-primary animate-pulse' />
                                    {t('thinking')}
                                </span>
                            )}
                        </div>
                        <div className='flex items-center gap-0.5'>
                            <Button variant='ghost' size='icon' className='size-7'
                                onClick={() => setIsMinimised(v => !v)}>
                                <Minus className='size-3.5' />
                            </Button>
                            <Button variant='ghost' size='icon' className='size-7' onClick={closePanel}>
                                <X className='size-3.5' />
                            </Button>
                        </div>
                    </div>

                    {!isMinimised && (
                        <>
                            {/* Loading */}
                            {isSessionLoading && messages.length === 0 && (
                                <div className='flex-1 flex items-center justify-center'>
                                    <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                                        <Bot className='size-8 animate-pulse' />
                                        <span className='text-xs'>{t('startingSession')}</span>
                                    </div>
                                </div>
                            )}

                            {/* Empty / welcome */}
                            {!isSessionLoading && displayMessages.length === 0 && (
                                <div className='flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center'>
                                    <Bot className='size-10 text-primary' />
                                    <div className='space-y-1'>
                                        <p className='text-sm font-medium'>{t('ready')}</p>
                                        <p className='text-xs text-muted-foreground'>
                                            {session?.is_large_video ? t('largeVideo') : t('emptyHint')}
                                        </p>
                                    </div>
                                    <div className='flex flex-wrap gap-1.5 justify-center'>
                                        {quickPrompts.map(chip => (
                                            <button key={chip} onClick={() => send(chip)}
                                                className='rounded-full border border-border px-2.5 py-1 text-xs
                                                           text-foreground hover:bg-muted transition-colors'>
                                                {chip}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Messages */}
                            {displayMessages.length > 0 && (
                                <CopilotMessages
                                    messages={displayMessages}
                                    onAccept={accept}
                                    onReject={reject}
                                    onScheduleAccept={msgUuid => accept(msgUuid, '', '')}
                                    onChipSelect={send}
                                />
                            )}

                            <CopilotInput onSend={send} disabled={isSending || isSessionLoading} />
                        </>
                    )}
                </div>
            )}
        </>
    )
}
