'use client'

import { useEffect, useState } from 'react'
import { Bot, Minus, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useAiCopilotContext } from './AiCopilotContext'
import { useCopilotSession } from './hooks/useCopilotSession'
import { useAiCopilot } from './hooks/useAiCopilot'
import { CopilotMessages } from './panel/CopilotMessages'
import { CopilotInput } from './panel/CopilotInput'

const THINKING_DOTS = [0, 1, 2] as const

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
                               size-14 rounded-full bg-primary text-primary-foreground
                               shadow-lg shadow-primary/25 hover:bg-primary/90
                               transition-all hover:scale-105 active:scale-95'
                    aria-label={t('title')}
                >
                    <Sparkles className='size-5' />
                </button>
            )}

            {/* Panel */}
            {isPanelOpen && (
                <div className={cn(
                    'fixed bottom-6 right-6 z-50 flex flex-col text-foreground',
                    'w-[420px] rounded-2xl border border-border bg-card shadow-2xl',
                    'transition-all duration-200',
                    isMinimised ? 'h-12 overflow-hidden' : 'h-[640px]',
                )}>
                    {/* Header */}
                    <div className='flex items-center justify-between px-4 py-3 border-b border-border shrink-0'>
                        <div className='flex items-center gap-2'>
                            <div className='size-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center'>
                                <Sparkles className='size-3 text-primary' />
                            </div>
                            <span className='text-sm font-semibold text-foreground'>{t('title')}</span>

                            {isSending && (
                                <span className='flex items-center gap-0.5 ml-1'>
                                    {THINKING_DOTS.map(i => (
                                        <span
                                            key={i}
                                            className='size-1 rounded-full bg-primary animate-bounce'
                                            style={{ animationDelay: `${i * 150}ms` }}
                                        />
                                    ))}
                                </span>
                            )}
                        </div>

                        <div className='flex items-center gap-0.5'>
                            <Button variant='ghost' size='icon' className='size-7 text-muted-foreground hover:text-foreground'
                                onClick={() => setIsMinimised(v => !v)}>
                                <Minus className='size-3.5' />
                            </Button>
                            <Button variant='ghost' size='icon' className='size-7 text-muted-foreground hover:text-foreground'
                                onClick={closePanel}>
                                <X className='size-3.5' />
                            </Button>
                        </div>
                    </div>

                    {!isMinimised && (
                        <>
                            {/* Loading */}
                            {isSessionLoading && messages.length === 0 && (
                                <div className='flex-1 flex items-center justify-center'>
                                    <div className='flex flex-col items-center gap-3 text-muted-foreground'>
                                        <div className='size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center'>
                                            <Sparkles className='size-5 text-primary animate-pulse' />
                                        </div>
                                        <span className='text-xs text-muted-foreground'>{t('startingSession')}</span>
                                    </div>
                                </div>
                            )}

                            {/* Empty / welcome — blocks.so style */}
                            {!isSessionLoading && displayMessages.length === 0 && (
                                <div className='flex-1 flex flex-col items-center justify-center gap-5 px-6 text-center'>
                                    <div className='space-y-2'>
                                        <div className='mx-auto size-12 rounded-2xl bg-primary/10 border border-primary/20
                                                        flex items-center justify-center'>
                                            <Sparkles className='size-6 text-primary' />
                                        </div>
                                        <p className='text-sm font-semibold text-foreground'>{t('ready')}</p>
                                        <p className='text-xs text-muted-foreground max-w-[260px] mx-auto leading-relaxed'>
                                            {session?.is_large_video ? t('largeVideo') : t('emptyHint')}
                                        </p>
                                    </div>

                                    {/* Quick prompt chips — blocks.so style */}
                                    <div className='flex flex-wrap gap-2 justify-center w-full'>
                                        {quickPrompts.map(chip => (
                                            <button
                                                key={chip}
                                                onClick={() => send(chip)}
                                                className='rounded-full border border-border bg-background text-foreground
                                                           px-3 py-1.5 text-xs font-medium
                                                           hover:bg-muted hover:border-primary/30
                                                           transition-all duration-150 active:scale-95'
                                            >
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
