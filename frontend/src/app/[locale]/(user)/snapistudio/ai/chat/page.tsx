'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Sparkles, Send, SkipForward, RefreshCw, CheckCircle2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    useStartConversationMutation,
    useAnswerStepMutation,
    useSkipStepMutation,
    useGenerateContentMutation,
    useGetConversationQuery,
    CREATOR_CHAT_POLL_INTERVAL_MS,
} from '@/store/services/ai-creator-chat.service'
import type { AiCreatorConversationType, AiConversationStatus } from '@/types/models/ai-creator-conversation.model'


const TERMINAL_STATUSES: AiConversationStatus[] = ['completed', 'failed']


type ChatBubble =
    | { id: string; from: 'ai';   text: string; options?: string[] | null; isOptional?: boolean }
    | { id: string; from: 'user'; text: string }


export default function AiCreatorChatPage() {
    const [conversationUuid, setConversationUuid] = useState<string | null>(null)
    const [bubbles,          setBubbles]          = useState<ChatBubble[]>([])
    const [inputValue,       setInputValue]       = useState('')
    const [copiedField,      setCopiedField]      = useState<string | null>(null)
    const isPolling                               = useRef(false)

    const [startConversation, { isLoading: isStarting }]   = useStartConversationMutation()
    const [answerStep,         { isLoading: isAnswering }]  = useAnswerStepMutation()
    const [skipStep,           { isLoading: isSkipping }]   = useSkipStepMutation()
    const [generateContent,    { isLoading: isGenerating }] = useGenerateContentMutation()

    const { data: pollData } = useGetConversationQuery(conversationUuid ?? '', {
        skip:            !conversationUuid || !isPolling.current,
        pollingInterval: isPolling.current ? CREATOR_CHAT_POLL_INTERVAL_MS : 0,
    })

    const conversation = pollData?.data ?? null

    // Stop polling on terminal status
    useEffect(() => {
        if (!conversation) return
        if (TERMINAL_STATUSES.includes(conversation.status)) {
            isPolling.current = false

            if (conversation.status === 'completed' && conversation.generated_result) {
                toast.success('Nội dung đã được tạo!')
            } else if (conversation.status === 'failed') {
                toast.error('AI gặp lỗi. Vui lòng thử lại.')
                addAiBubble(`Xin lỗi, tôi gặp sự cố: ${conversation.error_message ?? 'Lỗi không xác định'}. Hãy bắt đầu cuộc trò chuyện mới.`)
            }
        }
    }, [conversation?.status])

    const addAiBubble = (text: string, options?: string[] | null, isOptional?: boolean) => {
        setBubbles(prev => [...prev, {
            id:         `ai-${Date.now()}`,
            from:       'ai',
            text,
            options,
            isOptional,
        }])
    }

    const addUserBubble = (text: string) => {
        setBubbles(prev => [...prev, { id: `user-${Date.now()}`, from: 'user', text }])
    }

    const handleStart = useCallback(async () => {
        setBubbles([])
        setConversationUuid(null)
        isPolling.current = false

        const res = await startConversation().unwrap()
        const conv = res.data
        setConversationUuid(conv.uuid)

        addAiBubble(
            conv.last_ai_message ?? 'Video của bạn về chủ đề gì?',
            conv.options,
        )
    }, [startConversation])

    const handleSend = useCallback(async () => {
        if (!conversationUuid || !inputValue.trim() || isAnswering) return

        const text = inputValue.trim()
        addUserBubble(text)
        setInputValue('')

        const res     = await answerStep({ uuid: conversationUuid, answer: text }).unwrap()
        const updated = res.data

        if (updated.status === 'waiting_for_answer' && updated.last_ai_message) {
            addAiBubble(updated.last_ai_message, updated.options)
        } else if (updated.status === 'waiting_for_answer') {
            addAiBubble('Tất cả câu hỏi hoàn thành! Nhấn "Tạo nội dung" để AI tạo gợi ý.', null)
        }
    }, [conversationUuid, inputValue, isAnswering, answerStep])

    const handleOptionSelect = useCallback(async (option: string) => {
        if (!conversationUuid || isAnswering) return
        addUserBubble(option)

        const res     = await answerStep({ uuid: conversationUuid, answer: option }).unwrap()
        const updated = res.data

        if (updated.status === 'waiting_for_answer' && updated.last_ai_message) {
            addAiBubble(updated.last_ai_message, updated.options)
        }
    }, [conversationUuid, isAnswering, answerStep])

    const handleSkip = useCallback(async () => {
        if (!conversationUuid || isSkipping) return
        addUserBubble('(Bỏ qua)')

        const res     = await skipStep(conversationUuid).unwrap()
        const updated = res.data

        if (updated.status === 'waiting_for_answer' && updated.last_ai_message) {
            addAiBubble(updated.last_ai_message, updated.options)
        }
    }, [conversationUuid, isSkipping, skipStep])

    const handleGenerate = useCallback(async () => {
        if (!conversationUuid || isGenerating) return
        addAiBubble('Đang tạo nội dung cho bạn...')
        isPolling.current = true

        await generateContent(conversationUuid)
    }, [conversationUuid, isGenerating, generateContent])

    const handleCopy = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text)
        setCopiedField(field)
        toast.success('Copied!')
        setTimeout(() => setCopiedField(null), 2000)
    }

    const result            = conversation?.generated_result
    const isReadyToGenerate = conversation?.is_ready_to_generate === true
    const showGenerateBtn   = isReadyToGenerate
    const lastBubble       = bubbles[bubbles.length - 1]
    const lastIsOptional   = lastBubble?.from === 'ai' && (lastBubble as any).isOptional

    return (
        <div className='flex flex-col h-full max-w-2xl mx-auto gap-4 p-4'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <div className='flex size-8 items-center justify-center rounded-lg bg-primary/10'>
                        <Sparkles size={16} className='text-primary' />
                    </div>
                    <div>
                        <h1 className='text-lg font-semibold'>AI Creator Chat</h1>
                        <p className='text-xs text-muted-foreground'>Tạo nội dung video theo từng bước</p>
                    </div>
                </div>
                <Button size='sm' onClick={handleStart} disabled={isStarting}>
                    {isStarting ? <RefreshCw size={14} className='animate-spin mr-2' /> : null}
                    {bubbles.length > 0 ? 'Bắt đầu lại' : 'Bắt đầu'}
                </Button>
            </div>

            {/* Chat area */}
            <div className='flex-1 overflow-y-auto rounded-xl border border-border bg-muted/20 p-4 space-y-4 min-h-[400px]'>
                {bubbles.length === 0 && (
                    <div className='flex flex-col items-center justify-center h-full gap-3 text-center py-12'>
                        <Sparkles size={40} className='text-muted-foreground/30' />
                        <p className='text-sm font-medium'>AI Studio Creator Chat</p>
                        <p className='text-xs text-muted-foreground max-w-xs'>
                            Nhấn <strong>Bắt đầu</strong> để AI hỏi từng bước và tạo caption, hashtag phù hợp cho video của bạn.
                        </p>
                    </div>
                )}

                {bubbles.map((bubble, index) => (
                    <div
                        key={bubble.id}
                        className={cn('flex flex-col gap-2', bubble.from === 'user' && 'items-end')}
                    >
                        <div className={cn(
                            'max-w-[85%] rounded-xl px-4 py-2.5 text-sm',
                            bubble.from === 'ai'
                                ? 'bg-card border border-border text-foreground self-start'
                                : 'bg-primary text-primary-foreground self-end'
                        )}>
                            {bubble.text}
                        </div>

                        {/* Option buttons for AI bubbles */}
                        {bubble.from === 'ai' && (bubble as any).options && index === bubbles.length - 1 && (
                            <div className='flex flex-wrap gap-2 max-w-[85%]'>
                                {(bubble as any).options.map((opt: string) => (
                                    <button
                                        key={opt}
                                        type='button'
                                        onClick={() => handleOptionSelect(opt)}
                                        disabled={isAnswering}
                                        className='text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted hover:border-primary/50 transition-all'
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {/* Typing indicator */}
                {(isGenerating || isPolling.current) && (
                    <div className='flex gap-1.5 items-center bg-card border border-border rounded-xl px-4 py-3 w-fit'>
                        {[0, 150, 300].map(delay => (
                            <span
                                key={delay}
                                className='size-1.5 rounded-full bg-muted-foreground/50 animate-bounce'
                                style={{ animationDelay: `${delay}ms` }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Result card */}
            {result && conversation?.status === 'completed' && (
                <div className='rounded-xl border border-border bg-card p-4 space-y-3'>
                    <p className='text-sm font-semibold flex items-center gap-2'>
                        <CheckCircle2 size={16} className='text-green-500' />
                        Nội dung đã tạo
                    </p>

                    {(['short_caption', 'professional_caption', 'viral_caption'] as const).map(field => (
                        <div key={field} className='space-y-1'>
                            <div className='flex items-center justify-between'>
                                <p className='text-xs text-muted-foreground capitalize'>
                                    {field.replace('_caption', '').replace('_', ' ')}
                                </p>
                                <button
                                    type='button'
                                    onClick={() => handleCopy(result[field], field)}
                                    className='text-muted-foreground hover:text-foreground transition-colors'
                                >
                                    {copiedField === field
                                        ? <Check size={12} className='text-green-500' />
                                        : <Copy size={12} />
                                    }
                                </button>
                            </div>
                            <p className='text-sm bg-muted/50 rounded-lg p-2.5 leading-relaxed'>
                                {result[field]}
                            </p>
                        </div>
                    ))}

                    {result.hashtags.length > 0 && (
                        <div className='flex flex-wrap gap-1.5'>
                            {result.hashtags.map(tag => (
                                <button
                                    key={tag}
                                    type='button'
                                    onClick={() => handleCopy(tag, tag)}
                                    className='text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all'
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Input area */}
            {conversationUuid && conversation?.status === 'waiting_for_answer' && (
                <div className='flex flex-col gap-2'>
                    {showGenerateBtn ? (
                        <Button onClick={handleGenerate} disabled={isGenerating} className='w-full gap-2'>
                            <Sparkles size={14} className={cn(isGenerating && 'animate-pulse')} />
                            Tạo nội dung với AI
                        </Button>
                    ) : (
                        <div className='flex gap-2'>
                            <input
                                type='text'
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder='Nhập câu trả lời...'
                                disabled={isAnswering}
                                className='flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/50'
                            />
                            {lastIsOptional && (
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='icon'
                                    onClick={handleSkip}
                                    disabled={isSkipping}
                                    title='Bỏ qua'
                                >
                                    <SkipForward size={14} />
                                </Button>
                            )}
                            <Button
                                type='button'
                                size='icon'
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isAnswering}
                            >
                                <Send size={14} />
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
