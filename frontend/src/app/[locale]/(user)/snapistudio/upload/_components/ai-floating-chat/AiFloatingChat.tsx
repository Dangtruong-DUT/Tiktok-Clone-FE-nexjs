'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Sparkles, X, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAiContentSuggestion } from '@/hooks/studio/useAiContentSuggestion'
import { useTranslations } from 'next-intl'
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation'
import { Message, MessageContent } from '@/components/ai-elements/message'
import {
    PromptInput,
    PromptInputTextarea,
    PromptInputFooter,
    PromptInputSubmit
} from '@/components/ai-elements/prompt-input'
import { AiCaptionTabs } from './AiCaptionTabs'
import { AiHashtagChips } from './AiHashtagChips'
import type { AiContentSuggestionType } from '@/types/models/ai-content-suggestion.model'
import type { ChatStatus } from '@/components/ai-elements/prompt-input'

const MAX_INPUT_LENGTH = 300

type UserMessage = { id: string; role: 'user'; text: string }
type AssistantMessage = { id: string; role: 'assistant'; suggestion: AiContentSuggestionType }
type ChatMessage = UserMessage | AssistantMessage

interface AiFloatingChatProps {
    currentContent: string
    onApply: (text: string) => void
}

function TypingIndicator() {
    return (
        <Message from='assistant'>
            <MessageContent className='rounded-xl px-4 py-3'>
                <div className='flex gap-1.5 items-center'>
                    {([0, 150, 300] as const).map((delay) => (
                        <span
                            key={delay}
                            className='size-1.5 rounded-full bg-muted-foreground/50 animate-bounce'
                            style={{ animationDelay: `${delay}ms` }}
                        />
                    ))}
                </div>
            </MessageContent>
        </Message>
    )
}

interface AiResponseMessageProps {
    suggestion: AiContentSuggestionType
    onApply: (text: string) => void
    onMarkApplied: (uuid: string) => void
}

function AiResponseMessage({ suggestion, onApply, onMarkApplied }: AiResponseMessageProps) {
    const t = useTranslations('SnapiStudio.aiChat')
    const [selectedTags, setSelectedTags] = useState<Set<string>>(() => new Set(suggestion.hashtags))
    const [activeCaption, setActiveCaption] = useState<string>(suggestion.short_caption ?? '')
    const [applied, setApplied] = useState(false)

    const confidencePct = Math.round((suggestion.confidence_score ?? 0) * 100)

    const handleApply = useCallback(() => {
        const tags = Array.from(selectedTags)
        const combined = tags.length > 0 ? `${activeCaption}\n${tags.join(' ')}` : activeCaption
        onApply(combined)
        if (suggestion.uuid) onMarkApplied(suggestion.uuid)
        setApplied(true)
        toast.success(t('toast.applied'))
    }, [activeCaption, selectedTags, suggestion.uuid, onApply, onMarkApplied])

    const handleToggleTag = useCallback((tag: string) => {
        setSelectedTags((prev) => {
            const next = new Set(prev)
            if (next.has(tag)) {
                next.delete(tag)
            } else {
                next.add(tag)
            }
            return next
        })
    }, [])

    return (
        <Message from='assistant'>
            <MessageContent className='w-full space-y-3 rounded-xl border border-border bg-card px-4 py-3'>
                {/* Safety warning */}
                {suggestion.safety_notes && (
                    <div className='flex gap-2 rounded-lg bg-yellow-50 border border-yellow-200 p-2.5 text-xs text-yellow-800 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-400'>
                        <AlertTriangle size={13} className='mt-0.5 shrink-0' />
                        <p>{suggestion.safety_notes}</p>
                    </div>
                )}

                {/* Caption tabs */}
                <AiCaptionTabs suggestion={suggestion} onSelect={setActiveCaption} />

                <Separator />

                {/* Hashtag chips */}
                {suggestion.hashtags.length > 0 && (
                    <AiHashtagChips
                        hashtags={suggestion.hashtags}
                        selectedTags={selectedTags}
                        onToggle={handleToggleTag}
                        onSelectAll={() => setSelectedTags(new Set(suggestion.hashtags))}
                        onDeselectAll={() => setSelectedTags(new Set())}
                    />
                )}

                <Separator />

                {/* Metadata grid */}
                <div className='grid grid-cols-2 gap-2 text-xs'>
                    {suggestion.category_suggestion && (
                        <div className='rounded-lg bg-muted/50 border border-border p-2'>
                            <p className='text-muted-foreground mb-0.5'>{t('meta.category')}</p>
                            <p className='font-medium truncate'>{suggestion.category_suggestion}</p>
                        </div>
                    )}
                    {suggestion.content_intent && (
                        <div className='rounded-lg bg-muted/50 border border-border p-2'>
                            <p className='text-muted-foreground mb-0.5'>{t('meta.intent')}</p>
                            <p className='font-medium capitalize'>{suggestion.content_intent}</p>
                        </div>
                    )}
                    {suggestion.target_audience && (
                        <div className='col-span-2 rounded-lg bg-muted/50 border border-border p-2'>
                            <p className='text-muted-foreground mb-0.5'>{t('meta.audience')}</p>
                            <p className='font-medium leading-snug line-clamp-2'>{suggestion.target_audience}</p>
                        </div>
                    )}
                </div>

                {/* Confidence bar */}
                {suggestion.confidence_score !== null && (
                    <div className='space-y-1'>
                        <div className='flex justify-between text-xs text-muted-foreground'>
                            <span>{t('meta.confidence')}</span>
                            <span>{confidencePct}%</span>
                        </div>
                        <div className='h-1.5 w-full bg-muted rounded-full overflow-hidden'>
                            <div
                                className={cn(
                                    'h-full rounded-full transition-all duration-500',
                                    confidencePct >= 70
                                        ? 'bg-green-500'
                                        : confidencePct >= 40
                                          ? 'bg-yellow-500'
                                          : 'bg-red-400'
                                )}
                                style={{ width: `${confidencePct}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Apply button */}
                <Button
                    type='button'
                    size='sm'
                    className='w-full gap-2'
                    onClick={handleApply}
                    disabled={applied || !activeCaption}
                >
                    {applied ? (
                        <>
                            <CheckCircle2 size={14} className='text-green-400' />
                            {t('actions.applied')}
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={14} />
                            {t('actions.applyToPost')}
                            {selectedTags.size > 0 && (
                                <span className='text-xs opacity-75'>
                                    {t('actions.addHashtags', { count: selectedTags.size })}
                                </span>
                            )}
                        </>
                    )}
                </Button>
            </MessageContent>
        </Message>
    )
}

export function AiFloatingChat({ currentContent, onApply }: AiFloatingChatProps) {
    const t = useTranslations('SnapiStudio.aiChat')
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputValue, setInputValue] = useState('')
    const [chatStatus, setChatStatus] = useState<ChatStatus>('ready')
    const prevGeneratingRef = useRef(false)

    const { suggestion, isGenerating, isCompleted, isFailed, generate, regenerate, markApplied, reset } =
        useAiContentSuggestion()

    const welcomeContent = useMemo(
        () => (
            <div className='space-y-2 text-sm text-foreground/90'>
                <p>{t.rich('welcome.intro', { strong: (chunks) => <strong>{chunks}</strong> })}</p>
                <p>{t.rich('welcome.subtitle', { strong: (chunks) => <strong>{chunks}</strong> })}</p>
                <ul className='list-disc ml-4 space-y-0.5 text-muted-foreground'>
                    <li>{t('welcome.items.shortCaption')}</li>
                    <li>{t('welcome.items.hashtags')}</li>
                    <li>{t('welcome.items.meta')}</li>
                </ul>
            </div>
        ),
        [t]
    )

    useEffect(() => {
        if (isOpen && !inputValue && currentContent.trim()) {
            setInputValue(currentContent.trim().slice(0, MAX_INPUT_LENGTH))
        }
    }, [isOpen, inputValue, currentContent])

    // Append assistant message when generation reaches a terminal state
    useEffect(() => {
        const wasGenerating = prevGeneratingRef.current
        prevGeneratingRef.current = isGenerating

        if (wasGenerating && !isGenerating && (isCompleted || isFailed) && suggestion) {
            setMessages((prev) => [...prev, { id: `assistant-${Date.now()}`, role: 'assistant', suggestion }])
            setChatStatus('ready')
        }
    }, [isGenerating, isCompleted, isFailed, suggestion])

    const handleSend = useCallback(
        ({ text }: { text: string }) => {
            if (!text.trim() || chatStatus !== 'ready') return

            setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: 'user', text: text.trim() }])
            setInputValue('')
            setChatStatus('submitted')

            const hasHistory = messages.some((m) => m.role === 'assistant')
            if (hasHistory) {
                regenerate({ video_description: text.trim() })
            } else {
                generate({ video_description: text.trim() })
            }
        },
        [chatStatus, messages, generate, regenerate]
    )

    const handleReset = useCallback(() => {
        setMessages([])
        setInputValue(currentContent.trim().slice(0, MAX_INPUT_LENGTH))
        setChatStatus('ready')
        reset()
    }, [currentContent, reset])

    const hasHistory = messages.some((m) => m.role === 'assistant')

    return (
        <>
            {/* ── Floating trigger button ── */}
            <button
                type='button'
                onClick={() => setIsOpen((prev) => !prev)}
                className={cn(
                    'fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3',
                    'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all',
                    'text-sm font-medium',
                    isOpen && 'ring-2 ring-primary/30 ring-offset-2'
                )}
            >
                <Sparkles size={15} className={cn(isGenerating && 'animate-pulse')} />
                <span>{t('title')}</span>
                {isGenerating && <span className='size-2 rounded-full bg-yellow-300 animate-pulse' />}
                {isCompleted && !isGenerating && <span className='size-2 rounded-full bg-green-400' />}
            </button>

            {/* ── Floating chat panel ── */}
            {isOpen && (
                <div
                    className={cn(
                        'fixed bottom-20 right-6 z-50 flex h-[540px] w-[400px] flex-col overflow-hidden',
                        'rounded-2xl border border-border bg-card shadow-2xl',
                        'animate-in slide-in-from-bottom-4 fade-in duration-200'
                    )}
                >
                    {/* Header */}
                    <div className='flex shrink-0 items-center justify-between border-b border-border px-4 py-3'>
                        <div className='flex items-center gap-2'>
                            <div className='flex size-7 items-center justify-center rounded-lg bg-primary/10'>
                                <Sparkles size={14} className='text-primary' />
                            </div>
                            <span className='text-sm font-semibold'>{t('title')}</span>

                            {isGenerating && (
                                <Badge variant='secondary' className='animate-pulse gap-1 text-xs'>
                                    <span className='size-1.5 rounded-full bg-yellow-400' />
                                    {t('status.generating')}
                                </Badge>
                            )}
                            {isCompleted && !isGenerating && (
                                <Badge
                                    variant='secondary'
                                    className='gap-1 text-xs text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/40'
                                >
                                    <span className='size-1.5 rounded-full bg-green-500' />
                                    {t('status.completed')}
                                </Badge>
                            )}
                            {isFailed && !isGenerating && (
                                <Badge variant='destructive' className='gap-1 text-xs'>
                                    <AlertTriangle size={10} />
                                    {t('status.fallback')}
                                </Badge>
                            )}
                        </div>

                        <div className='flex items-center gap-1'>
                            {hasHistory && (
                                <Button
                                    type='button'
                                    variant='ghost'
                                    size='icon'
                                    className='size-7 text-muted-foreground'
                                    onClick={handleReset}
                                    title={t('actions.clearHistory')}
                                >
                                    <RotateCcw size={13} />
                                </Button>
                            )}
                            <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='size-7 text-muted-foreground'
                                onClick={() => setIsOpen(false)}
                            >
                                <X size={14} />
                            </Button>
                        </div>
                    </div>

                    {/* Conversation */}
                    <Conversation className='bg-muted/20'>
                        <ConversationContent>
                            {/* Welcome message */}
                            <Message from='assistant'>
                                <MessageContent>{welcomeContent}</MessageContent>
                            </Message>

                            {/* Chat history */}
                            {messages.map((msg) =>
                                msg.role === 'user' ? (
                                    <Message key={msg.id} from='user'>
                                        <MessageContent className='rounded-xl bg-secondary px-4 py-2.5 text-secondary-foreground whitespace-pre-wrap'>
                                            {msg.text}
                                        </MessageContent>
                                    </Message>
                                ) : (
                                    <AiResponseMessage
                                        key={msg.id}
                                        suggestion={msg.suggestion}
                                        onApply={onApply}
                                        onMarkApplied={markApplied}
                                    />
                                )
                            )}

                            {/* Typing indicator */}
                            {isGenerating && <TypingIndicator />}
                        </ConversationContent>
                        <ConversationScrollButton />
                    </Conversation>

                    {/* Prompt input */}
                    <PromptInput
                        value={inputValue}
                        onValueChange={setInputValue}
                        status={chatStatus}
                        onSubmit={handleSend}
                    >
                        <PromptInputTextarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={t('input.placeholder')}
                            disabled={chatStatus !== 'ready'}
                        />
                        <PromptInputFooter>
                            <span className='pl-1 text-xs text-muted-foreground'>
                                {hasHistory ? t('input.hintRegenerate') : t('input.hintNew')}
                            </span>
                            <PromptInputSubmit status={chatStatus} aria-label={t('input.submit')} />
                        </PromptInputFooter>
                    </PromptInput>
                </div>
            )}
        </>
    )
}
