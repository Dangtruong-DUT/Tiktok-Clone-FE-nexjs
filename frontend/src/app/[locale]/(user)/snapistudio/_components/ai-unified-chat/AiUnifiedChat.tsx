'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
    Sparkles, X, MessageSquare, Zap, Wand2,
    Send, RefreshCw, Check, Copy, SkipForward,
    CheckCircle2, AlertTriangle, RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { usePathname } from 'next/navigation'
import {
    useStartConversationMutation,
    useAnswerStepMutation,
    useSkipStepMutation,
    useGenerateContentMutation,
    useGetConversationQuery,
    CREATOR_CHAT_POLL_INTERVAL_MS,
} from '@/store/services/ai-creator-chat.service'
import {
    useAnalyzeViralScoreMutation,
    useGetViralScoreQuery,
    VIRAL_SCORE_POLL_INTERVAL_MS,
} from '@/store/services/ai-viral-score.service'
import { useAiContentSuggestion } from '@/hooks/studio/useAiContentSuggestion'
import { useAiChatContext } from './AiChatContext'
import type { AiConversationStatus } from '@/types/models/ai-creator-conversation.model'
import type { ViralScoreLevel } from '@/types/models/ai-viral-score.model'
import type { AiContentSuggestionType } from '@/types/models/ai-content-suggestion.model'

type Mode = 'caption' | 'chat' | 'viral'

const TERMINAL: AiConversationStatus[] = ['completed', 'failed']

const LEVEL_COLORS: Record<ViralScoreLevel, string> = {
    low:    'text-red-500 bg-red-50 border-red-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    high:   'text-blue-500 bg-blue-50 border-blue-200',
    viral:  'text-green-600 bg-green-50 border-green-200',
}

const BREAKDOWN_LABELS: Record<string, string> = {
    hook_strength:      'Hook Strength',
    hashtag_quality:    'Hashtag Quality',
    audience_clarity:   'Audience Clarity',
    engagement_trigger: 'Engagement Trigger',
    format_fit:         'Format Fit',
}

/* ─────────── Caption mode (replaces AiFloatingChat) ─────────── */
function HashtagChips({
    hashtags, selected, onToggle, onSelectAll, onDeselectAll
}: {
    hashtags: string[]
    selected: Set<string>
    onToggle: (t: string) => void
    onSelectAll: () => void
    onDeselectAll: () => void
}) {
    return (
        <div className='space-y-2'>
            <div className='flex items-center justify-between'>
                <span className='text-xs font-medium text-muted-foreground'>
                    Hashtags <span className='text-muted-foreground/60'>({selected.size}/{hashtags.length})</span>
                </span>
                <div className='flex gap-2 text-xs'>
                    <button type='button' onClick={onSelectAll} className='text-primary hover:underline'>Chọn tất cả</button>
                    <span className='text-muted-foreground'>·</span>
                    <button type='button' onClick={onDeselectAll} className='text-muted-foreground hover:text-foreground'>Bỏ chọn</button>
                </div>
            </div>
            <div className='flex flex-wrap gap-1.5'>
                {hashtags.map(tag => (
                    <button
                        key={tag}
                        type='button'
                        onClick={() => onToggle(tag)}
                        className={cn(
                            'text-xs px-2.5 py-1 rounded-full border transition-all',
                            selected.has(tag)
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50'
                        )}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    )
}

function SuggestionCard({
    suggestion, onApply
}: {
    suggestion: AiContentSuggestionType
    onApply: ((text: string) => void) | null
}) {
    const [activeCaption, setActiveCaption] = useState(suggestion.short_caption ?? '')
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set(suggestion.hashtags))
    const [applied, setApplied] = useState(false)

    const handleToggleTag = (tag: string) => {
        setSelectedTags(prev => {
            const next = new Set(prev)
            if (next.has(tag)) { next.delete(tag) } else { next.add(tag) }
            return next
        })
    }

    const handleApply = () => {
        if (!onApply) return
        const tags = Array.from(selectedTags)
        onApply(tags.length > 0 ? `${activeCaption}\n${tags.join(' ')}` : activeCaption)
        setApplied(true)
        toast.success('Đã áp dụng vào bài đăng!')
    }

    const TABS = [
        { key: 'short',        label: 'Ngắn',        caption: suggestion.short_caption },
        { key: 'professional', label: 'Chuyên nghiệp', caption: suggestion.professional_caption },
        { key: 'viral',        label: 'Viral',        caption: suggestion.viral_caption },
    ] as const

    const [activeTab, setActiveTabKey] = useState<string>('short')
    const handleTabChange = (key: string, caption: string) => {
        setActiveTabKey(key); setActiveCaption(caption ?? '')
    }

    return (
        <div className='rounded-xl border border-border bg-card p-3 space-y-3'>
            {suggestion.safety_notes && (
                <div className='flex gap-2 rounded-lg bg-yellow-50 border border-yellow-200 p-2 text-xs text-yellow-800'>
                    <AlertTriangle size={12} className='shrink-0 mt-0.5' />
                    <p>{suggestion.safety_notes}</p>
                </div>
            )}

            {/* Caption tabs */}
            <div className='space-y-2'>
                <div className='flex gap-1 bg-muted rounded-lg p-1'>
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            type='button'
                            onClick={() => handleTabChange(tab.key, tab.caption ?? '')}
                            className={cn(
                                'flex-1 text-xs font-medium py-1.5 rounded-md transition-all',
                                activeTab === tab.key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className='rounded-lg bg-muted/50 border border-border p-2.5 min-h-[60px]'>
                    <p className='text-sm leading-relaxed whitespace-pre-wrap'>
                        {TABS.find(t => t.key === activeTab)?.caption ||
                            <span className='text-muted-foreground italic text-xs'>Chưa có caption</span>
                        }
                    </p>
                </div>
            </div>

            <Separator />

            {/* Hashtag chips */}
            {suggestion.hashtags.length > 0 && (
                <HashtagChips
                    hashtags={suggestion.hashtags}
                    selected={selectedTags}
                    onToggle={handleToggleTag}
                    onSelectAll={() => setSelectedTags(new Set(suggestion.hashtags))}
                    onDeselectAll={() => setSelectedTags(new Set())}
                />
            )}

            {/* Meta */}
            <div className='grid grid-cols-2 gap-2 text-xs'>
                {suggestion.category_suggestion && (
                    <div className='rounded-lg bg-muted/50 border border-border p-2'>
                        <p className='text-muted-foreground mb-0.5'>Danh mục</p>
                        <p className='font-medium truncate'>{suggestion.category_suggestion}</p>
                    </div>
                )}
                {suggestion.content_intent && (
                    <div className='rounded-lg bg-muted/50 border border-border p-2'>
                        <p className='text-muted-foreground mb-0.5'>Mục đích</p>
                        <p className='font-medium capitalize'>{suggestion.content_intent}</p>
                    </div>
                )}
            </div>

            {/* Confidence + Apply */}
            {suggestion.confidence_score !== null && (
                <div className='space-y-1'>
                    <div className='flex justify-between text-xs text-muted-foreground'>
                        <span>Độ tin cậy</span><span>{Math.round((suggestion.confidence_score ?? 0) * 100)}%</span>
                    </div>
                    <div className='h-1.5 w-full bg-muted rounded-full overflow-hidden'>
                        <div
                            className={cn('h-full rounded-full transition-all duration-500',
                                (suggestion.confidence_score ?? 0) >= 0.7 ? 'bg-green-500' :
                                (suggestion.confidence_score ?? 0) >= 0.4 ? 'bg-yellow-500' : 'bg-red-400'
                            )}
                            style={{ width: `${(suggestion.confidence_score ?? 0) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {onApply && (
                <Button
                    type='button' size='sm' className='w-full gap-2'
                    onClick={handleApply} disabled={applied || !activeCaption}
                >
                    {applied
                        ? <><CheckCircle2 size={13} className='text-green-400' /> Đã áp dụng</>
                        : <><CheckCircle2 size={13} /> Áp dụng vào bài đăng</>
                    }
                </Button>
            )}
        </div>
    )
}

function CaptionMode() {
    const { uploadContent, applyToUpload } = useAiChatContext()
    const [description, setDescription] = useState('')
    const [hasUsedUploadContent, setHasUsedUploadContent] = useState(false)

    const { suggestion, isGenerating, isCompleted, isFailed, generate, regenerate, reset } = useAiContentSuggestion()

    // Pre-fill from upload form content when available
    useEffect(() => {
        if (uploadContent && !hasUsedUploadContent) {
            setDescription(uploadContent.slice(0, 300))
            setHasUsedUploadContent(true)
        }
    }, [uploadContent, hasUsedUploadContent])

    const handleGenerate = () => {
        if (!description.trim()) return
        if (isCompleted || isFailed) {
            regenerate({ video_description: description.trim() })
        } else {
            generate({ video_description: description.trim() })
        }
    }

    const handleReset = () => {
        reset()
        setDescription('')
        setHasUsedUploadContent(false)
    }

    return (
        <div className='flex flex-col h-full'>
            <div className='p-4 space-y-3 shrink-0'>
                <div className='space-y-1.5'>
                    <div className='flex items-center justify-between'>
                        <label className='text-xs font-medium text-muted-foreground'>
                            Mô tả video {uploadContent && <span className='text-primary'>(đã đồng bộ từ form)</span>}
                        </label>
                        {(isCompleted || isFailed) && (
                            <button type='button' onClick={handleReset} className='text-xs text-muted-foreground hover:text-foreground flex items-center gap-1'>
                                <RotateCcw size={11} /> Làm lại
                            </button>
                        )}
                    </div>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder='Mô tả nội dung video của bạn...'
                        rows={3}
                        disabled={isGenerating}
                        className='w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm resize-none outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50'
                    />
                </div>
                <Button
                    onClick={handleGenerate}
                    disabled={!description.trim() || isGenerating}
                    className='w-full gap-2 text-sm'
                >
                    {isGenerating
                        ? <><RefreshCw size={13} className='animate-spin' /> Đang tạo...</>
                        : isCompleted || isFailed
                            ? <><Wand2 size={13} /> Tạo lại</>
                            : <><Wand2 size={13} /> Tạo caption & hashtag</>
                    }
                </Button>
            </div>

            <div className='flex-1 overflow-y-auto px-4 pb-4 min-h-0'>
                {isGenerating && (
                    <div className='flex gap-1.5 items-center bg-card border border-border rounded-xl px-4 py-3 w-fit'>
                        {[0, 150, 300].map(d => (
                            <span key={d} className='size-1.5 rounded-full bg-muted-foreground/40 animate-bounce' style={{ animationDelay: `${d}ms` }} />
                        ))}
                    </div>
                )}
                {(isCompleted || isFailed) && suggestion && (
                    <SuggestionCard suggestion={suggestion} onApply={applyToUpload} />
                )}
            </div>
        </div>
    )
}

/* ─────────── Creator Chat mode ─────────── */
type Bubble =
    | { id: string; from: 'ai';   text: string; options?: string[] | null; isOptional?: boolean }
    | { id: string; from: 'user'; text: string }

function ChatMode() {
    const [uuid, setUuid]       = useState<string | null>(null)
    const [bubbles, setBubbles] = useState<Bubble[]>([])
    const [input, setInput]     = useState('')
    const [copied, setCopied]   = useState<string | null>(null)
    const polling               = useRef(false)

    const [start,    { isLoading: isStarting  }] = useStartConversationMutation()
    const [answer,   { isLoading: isAnswering }] = useAnswerStepMutation()
    const [skip,     { isLoading: isSkipping  }] = useSkipStepMutation()
    const [generate, { isLoading: isGenerating }] = useGenerateContentMutation()

    const { data: pollData } = useGetConversationQuery(uuid ?? '', {
        skip:            !uuid || !polling.current,
        pollingInterval: polling.current ? CREATOR_CHAT_POLL_INTERVAL_MS : 0,
    })
    const conv = pollData?.data ?? null

    useEffect(() => {
        if (!conv || !TERMINAL.includes(conv.status)) return
        polling.current = false
        if (conv.status === 'failed') addAI('Xin lỗi, AI gặp lỗi. Vui lòng thử lại.')
    }, [conv?.status])

    const addAI   = (text: string, options?: string[] | null, isOptional?: boolean) =>
        setBubbles(p => [...p, { id: `ai-${Date.now()}`, from: 'ai', text, options, isOptional }])
    const addUser = (text: string) =>
        setBubbles(p => [...p, { id: `u-${Date.now()}`, from: 'user', text }])

    const handleStart = useCallback(async () => {
        setBubbles([]); setUuid(null); polling.current = false
        const r = await start().unwrap()
        setUuid(r.data.uuid)
        addAI(r.data.last_ai_message ?? '', r.data.options)
    }, [start])

    const handleSend = useCallback(async () => {
        if (!uuid || !input.trim() || isAnswering) return
        const txt = input.trim(); addUser(txt); setInput('')
        const r = await answer({ uuid, answer: txt }).unwrap()
        if (r.data.status === 'waiting_for_answer' && r.data.last_ai_message)
            addAI(r.data.last_ai_message, r.data.options)
    }, [uuid, input, isAnswering, answer])

    const handleOption = useCallback(async (opt: string) => {
        if (!uuid || isAnswering) return
        addUser(opt)
        const r = await answer({ uuid, answer: opt }).unwrap()
        if (r.data.status === 'waiting_for_answer' && r.data.last_ai_message)
            addAI(r.data.last_ai_message, r.data.options)
    }, [uuid, isAnswering, answer])

    const handleSkip = useCallback(async () => {
        if (!uuid || isSkipping) return
        addUser('(Bỏ qua)')
        const r = await skip(uuid).unwrap()
        if (r.data.status === 'waiting_for_answer' && r.data.last_ai_message)
            addAI(r.data.last_ai_message, r.data.options)
    }, [uuid, isSkipping, skip])

    const handleGenerate = useCallback(async () => {
        if (!uuid || isGenerating) return
        addAI('Đang tạo nội dung cho bạn...')
        polling.current = true
        await generate(uuid)
    }, [uuid, isGenerating, generate])

    const handleCopy = async (text: string, key: string) => {
        await navigator.clipboard.writeText(text)
        setCopied(key); toast.success('Đã sao chép!'); setTimeout(() => setCopied(null), 2000)
    }

    const result       = conv?.generated_result
    const isReady      = conv?.is_ready_to_generate === true
    const lastBubble   = bubbles[bubbles.length - 1]
    const lastOptional = lastBubble?.from === 'ai' && (lastBubble as any).isOptional

    return (
        <div className='flex flex-col h-full'>
            <div className='px-4 pt-3 pb-2.5 flex items-center justify-between border-b border-border shrink-0'>
                <p className='text-xs text-muted-foreground'>Tạo nội dung theo từng bước với AI</p>
                <Button size='sm' variant='outline' onClick={handleStart} disabled={isStarting} className='text-xs h-7 gap-1'>
                    {isStarting ? <RefreshCw size={11} className='animate-spin' /> : null}
                    {bubbles.length > 0 ? 'Bắt đầu lại' : 'Bắt đầu'}
                </Button>
            </div>

            <div className='flex-1 overflow-y-auto p-4 space-y-3 min-h-0'>
                {bubbles.length === 0 && (
                    <div className='flex flex-col items-center justify-center h-full gap-2 text-center py-8'>
                        <MessageSquare size={32} className='text-muted-foreground/20' />
                        <p className='text-sm text-muted-foreground'>
                            Nhấn <strong>Bắt đầu</strong> để AI hỏi từng bước và tạo caption, hashtag cho video
                        </p>
                    </div>
                )}
                {bubbles.map((b, idx) => (
                    <div key={b.id} className={cn('flex flex-col gap-2', b.from === 'user' && 'items-end')}>
                        <div className={cn(
                            'max-w-[90%] rounded-xl px-3.5 py-2 text-sm',
                            b.from === 'ai'
                                ? 'bg-card border border-border self-start'
                                : 'bg-primary text-primary-foreground self-end'
                        )}>
                            {b.text}
                        </div>
                        {b.from === 'ai' && (b as any).options && idx === bubbles.length - 1 && (
                            <div className='flex flex-wrap gap-1.5 max-w-[90%]'>
                                {(b as any).options.map((opt: string) => (
                                    <button
                                        key={opt} onClick={() => handleOption(opt)} disabled={isAnswering}
                                        className='text-xs px-2.5 py-1 rounded-full border border-border bg-background hover:bg-muted transition-all'
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {(isGenerating || polling.current) && (
                    <div className='flex gap-1.5 items-center bg-card border border-border rounded-xl px-3.5 py-2.5 w-fit'>
                        {[0, 150, 300].map(d => (
                            <span key={d} className='size-1.5 rounded-full bg-muted-foreground/40 animate-bounce' style={{ animationDelay: `${d}ms` }} />
                        ))}
                    </div>
                )}
                {result && conv?.status === 'completed' && (
                    <div className='rounded-xl border border-border bg-card p-3 space-y-2.5'>
                        {(['short_caption', 'professional_caption', 'viral_caption'] as const).map(field => (
                            <div key={field} className='space-y-1'>
                                <div className='flex items-center justify-between'>
                                    <p className='text-xs text-muted-foreground capitalize'>{field.replace('_caption', '').replace('_', ' ')}</p>
                                    <button onClick={() => handleCopy(result[field], field)} className='text-muted-foreground hover:text-foreground'>
                                        {copied === field ? <Check size={12} className='text-green-500' /> : <Copy size={12} />}
                                    </button>
                                </div>
                                <p className='text-sm bg-muted/50 rounded-lg p-2 leading-relaxed'>{result[field]}</p>
                            </div>
                        ))}
                        {result.hashtags.length > 0 && (
                            <div className='flex flex-wrap gap-1'>
                                {result.hashtags.map(tag => (
                                    <button key={tag} onClick={() => handleCopy(tag, tag)}
                                        className='text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all'>
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {uuid && conv?.status === 'waiting_for_answer' && (
                <div className='p-3 border-t border-border shrink-0'>
                    {isReady ? (
                        <Button onClick={handleGenerate} disabled={isGenerating} className='w-full gap-2 text-sm'>
                            <Sparkles size={14} className={cn(isGenerating && 'animate-pulse')} />
                            Tạo nội dung với AI
                        </Button>
                    ) : (
                        <div className='flex gap-2'>
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder='Nhập câu trả lời...'
                                disabled={isAnswering}
                                className='flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary/50'
                            />
                            {lastOptional && (
                                <Button type='button' variant='outline' size='icon' className='size-8 shrink-0' onClick={handleSkip} disabled={isSkipping} title='Bỏ qua'>
                                    <SkipForward size={13} />
                                </Button>
                            )}
                            <Button type='button' size='icon' className='size-8 shrink-0' onClick={handleSend} disabled={!input.trim() || isAnswering}>
                                <Send size={13} />
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

/* ─────────── Viral Score mode ─────────── */
function ViralMode() {
    const [caption, setCaption]       = useState('')
    const [hashtagStr, setHashtagStr] = useState('')
    const [scoreUuid, setScoreUuid]   = useState<string | null>(null)
    const polling = useRef(false)

    const [analyze, { isLoading: isAnalyzing }] = useAnalyzeViralScoreMutation()
    const { data: pollData } = useGetViralScoreQuery(scoreUuid ?? '', {
        skip:            !scoreUuid || !polling.current,
        pollingInterval: polling.current ? VIRAL_SCORE_POLL_INTERVAL_MS : 0,
    })
    const score = pollData?.data ?? null

    useEffect(() => {
        if (score && (score.status === 'completed' || score.status === 'failed')) {
            polling.current = false
            if (score.status === 'failed') toast.error('Phân tích thất bại.')
        }
    }, [score?.status])

    const handleAnalyze = async () => {
        if (!caption.trim()) return
        const hashtags = hashtagStr.split(/[\s,]+/).filter(Boolean).map(h => h.startsWith('#') ? h : `#${h}`)
        const r = await analyze({ caption: caption.trim(), hashtags }).unwrap()
        setScoreUuid(r.data.uuid); polling.current = true
    }

    const isLoading = isAnalyzing || (polling.current && score?.status !== 'completed')

    return (
        <div className='flex flex-col h-full overflow-y-auto'>
            <div className='p-4 space-y-3'>
                <div className='space-y-1'>
                    <label className='text-xs font-medium text-muted-foreground'>Caption *</label>
                    <textarea
                        value={caption} onChange={e => setCaption(e.target.value)}
                        placeholder='Nhập caption cần chấm điểm...' rows={3}
                        className='w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm resize-none outline-none focus:ring-1 focus:ring-primary/50'
                    />
                </div>
                <div className='space-y-1'>
                    <label className='text-xs font-medium text-muted-foreground'>Hashtags</label>
                    <input
                        value={hashtagStr} onChange={e => setHashtagStr(e.target.value)}
                        placeholder='#fyp #viral ...'
                        className='w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/50'
                    />
                </div>
                <Button onClick={handleAnalyze} disabled={!caption.trim() || isLoading} className='w-full gap-2 text-sm'>
                    {isLoading
                        ? <><RefreshCw size={13} className='animate-spin' /> Đang phân tích...</>
                        : <><Zap size={13} /> Chấm điểm Viral</>
                    }
                </Button>
            </div>

            {score && score.status === 'completed' && (
                <div className='px-4 pb-4 space-y-3'>
                    <div className={cn('rounded-xl border p-4 text-center', score.level ? LEVEL_COLORS[score.level] : 'bg-card border-border')}>
                        <p className='text-4xl font-bold'>{Math.round(score.overall_score ?? 0)}</p>
                        <p className='text-sm font-medium mt-1'>/ 100 — {score.level_label}</p>
                    </div>
                    {score.breakdown && (
                        <div className='space-y-2'>
                            {Object.entries(score.breakdown).map(([k, v]) => (
                                <div key={k} className='space-y-0.5'>
                                    <div className='flex justify-between text-xs text-muted-foreground'>
                                        <span>{BREAKDOWN_LABELS[k] ?? k}</span>
                                        <span>{Math.round(v as number)}/100</span>
                                    </div>
                                    <div className='h-1.5 w-full bg-muted rounded-full overflow-hidden'>
                                        <div className='h-full bg-primary rounded-full' style={{ width: `${v}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {score.improved_caption && (
                        <div className='rounded-xl border border-border bg-card p-3 space-y-1.5'>
                            <p className='text-xs font-semibold'>Caption cải thiện</p>
                            <p className='text-sm leading-relaxed'>{score.improved_caption}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

/* ─────────── Main floating component ─────────── */
export function AiUnifiedChat() {
    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState<Mode>('caption')
    const { uploadContent } = useAiChatContext()
    const pathname = usePathname()

    const isUploadPage = pathname.includes('/snapistudio/upload')

    const MODES = [
        { key: 'caption' as const, label: isUploadPage ? 'Caption & Hashtag' : 'Tạo caption', icon: Wand2 },
        { key: 'chat'    as const, label: 'Tạo nội dung', icon: MessageSquare },
        { key: 'viral'   as const, label: 'Viral Score',  icon: Zap },
    ]

    return (
        <>
            {/* Trigger */}
            <button
                type='button'
                onClick={() => setOpen(v => !v)}
                className={cn(
                    'fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3',
                    'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all text-sm font-medium',
                    open && 'ring-2 ring-primary/30 ring-offset-2'
                )}
            >
                <Sparkles size={15} />
                AI Studio
                {isUploadPage && uploadContent && (
                    <span className='size-2 rounded-full bg-green-400' title='Form content synced' />
                )}
            </button>

            {/* Panel */}
            {open && (
                <div className={cn(
                    'fixed bottom-20 right-6 z-50 flex flex-col w-[420px] h-[580px]',
                    'rounded-2xl border border-border bg-card shadow-2xl overflow-hidden',
                    'animate-in slide-in-from-bottom-4 fade-in duration-200'
                )}>
                    {/* Header */}
                    <div className='flex shrink-0 items-center justify-between border-b border-border px-4 py-3'>
                        <div className='flex items-center gap-2'>
                            <div className='flex size-7 items-center justify-center rounded-lg bg-primary/10'>
                                <Sparkles size={14} className='text-primary' />
                            </div>
                            <span className='text-sm font-semibold'>AI Studio</span>
                            {isUploadPage && uploadContent && (
                                <Badge variant='secondary' className='text-xs gap-1'>
                                    <span className='size-1.5 rounded-full bg-green-500' />
                                    Đã đồng bộ form
                                </Badge>
                            )}
                        </div>
                        <Button type='button' variant='ghost' size='icon' className='size-7 text-muted-foreground' onClick={() => setOpen(false)}>
                            <X size={14} />
                        </Button>
                    </div>

                    {/* Mode chips */}
                    <div className='flex shrink-0 gap-1.5 px-4 py-2.5 border-b border-border bg-muted/30'>
                        {MODES.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key} onClick={() => setMode(key)}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                                    mode === key
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
                                )}
                            >
                                <Icon size={12} />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className='flex-1 min-h-0'>
                        {mode === 'caption' && <CaptionMode />}
                        {mode === 'chat'    && <ChatMode />}
                        {mode === 'viral'   && <ViralMode />}
                    </div>
                </div>
            )}
        </>
    )
}
