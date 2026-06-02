'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import {
    Sparkles, X, AlertTriangle,
    CheckCircle2, Copy, Check, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAiContentSuggestion } from '@/hooks/studio/useAiContentSuggestion'

const CAPTION_TYPES = [
    { key: 'short',        label: 'Short',        field: 'short_caption' as const },
    { key: 'professional', label: 'Professional', field: 'professional_caption' as const },
    { key: 'viral',        label: 'Viral',        field: 'viral_caption' as const },
]

interface AiFloatingChatProps {
    /** Current value of the form's content/caption field */
    currentContent: string
    /** Called when user applies suggestions — injects caption + hashtags into form */
    onApply: (text: string) => void
}

export function AiFloatingChat({ currentContent, onApply }: AiFloatingChatProps) {
    const [isOpen, setIsOpen]               = useState(false)
    const [activeCaption, setActiveCaption] = useState<'short' | 'professional' | 'viral'>('short')
    const [selectedTags, setSelectedTags]   = useState<Set<string>>(new Set())
    const [copiedCaption, setCopiedCaption] = useState(false)

    const { suggestion, isGenerating, isCompleted, isFailed, generate, regenerate, markApplied } =
        useAiContentSuggestion()

    // Auto-select all hashtags whenever a new suggestion arrives
    useEffect(() => {
        if (isCompleted && suggestion?.hashtags) {
            setSelectedTags(new Set(suggestion.hashtags))
        }
    }, [isCompleted, suggestion])

    const hasResult  = (isCompleted || isFailed) && !!suggestion
    const isLoading  = isGenerating

    // Compute the caption text currently selected
    const captionField = CAPTION_TYPES.find(t => t.key === activeCaption)!.field
    const captionText  = suggestion?.[captionField] ?? ''

    // Confidence percent
    const confidencePct = Math.round((suggestion?.confidence_score ?? 0) * 100)

    // --- Handlers ---

    const handleGenerate = useCallback(() => {
        if (!currentContent.trim()) {
            toast.warning('Hãy nhập mô tả video trước khi dùng AI Studio.')
            return
        }
        setSelectedTags(new Set())
        generate({
            video_description: currentContent,
            // creator_language omitted — backend auto-detects from X-Locale header
        })
    }, [currentContent, generate])

    const handleRegenerate = useCallback(() => {
        if (!currentContent.trim()) return
        setSelectedTags(new Set())
        regenerate({
            video_description: currentContent,
        })
    }, [currentContent, regenerate])

    const handleToggleTag = (tag: string) => {
        setSelectedTags(prev => {
            const next = new Set(prev)
            if (next.has(tag)) {
                next.delete(tag)
            } else {
                next.add(tag)
            }
            return next
        })
    }

    const handleSelectAllTags = () => {
        setSelectedTags(new Set(suggestion?.hashtags ?? []))
    }

    const handleDeselectAllTags = () => {
        setSelectedTags(new Set())
    }

    const handleCopyCaption = async () => {
        if (!captionText) return
        await navigator.clipboard.writeText(captionText)
        setCopiedCaption(true)
        setTimeout(() => setCopiedCaption(false), 2000)
        toast.success('Caption copied!')
    }

    const handleApplyToForm = () => {
        if (!captionText) return

        const tags     = Array.from(selectedTags)
        const combined = tags.length ? `${captionText}\n${tags.join(' ')}` : captionText

        onApply(combined)

        // Mark as applied on backend for analytics (fire-and-forget)
        if (suggestion?.uuid) markApplied(suggestion.uuid)

        setIsOpen(false)
        toast.success('Caption và hashtags đã được áp dụng vào form!')
    }

    const contentPreview = useMemo(() => {
        if (!currentContent.trim()) return null
        return currentContent.trim().slice(0, 80) + (currentContent.length > 80 ? '...' : '')
    }, [currentContent])

    return (
        <>
            {/* ── Floating trigger ── */}
            <button
                type='button'
                onClick={() => setIsOpen(prev => !prev)}
                className={cn(
                    'fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3',
                    'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all',
                    'text-sm font-medium',
                    isOpen && 'ring-2 ring-primary/30 ring-offset-2'
                )}
            >
                <Sparkles size={15} className={cn(isLoading && 'animate-pulse')} />
                <span>AI Studio</span>
                {isLoading && <span className='h-2 w-2 rounded-full bg-yellow-300 animate-pulse' />}
                {isCompleted && !isLoading && <span className='h-2 w-2 rounded-full bg-green-400' />}
            </button>

            {/* ── Floating panel ── */}
            {isOpen && (
                <div className={cn(
                    'fixed bottom-20 right-6 z-50 w-[380px] max-h-[85vh]',
                    'rounded-2xl border border-border bg-background shadow-2xl',
                    'flex flex-col overflow-hidden',
                    'animate-in slide-in-from-bottom-4 fade-in duration-200'
                )}>
                    {/* Header */}
                    <div className='flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 shrink-0'>
                        <div className='flex items-center gap-2'>
                            <Sparkles size={14} className='text-primary' />
                            <span className='text-sm font-semibold'>AI Content Studio</span>
                            {isLoading && (
                                <Badge variant='secondary' className='text-xs animate-pulse'>Đang tạo...</Badge>
                            )}
                            {isCompleted && (
                                <Badge variant='secondary' className='text-xs text-green-600 bg-green-50'>
                                    <CheckCircle2 size={10} className='mr-1' /> Xong
                                </Badge>
                            )}
                            {isFailed && (
                                <Badge variant='destructive' className='text-xs'>
                                    <AlertTriangle size={10} className='mr-1' /> Fallback
                                </Badge>
                            )}
                        </div>
                        <button
                            type='button'
                            onClick={() => setIsOpen(false)}
                            className='p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors'
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Scrollable body */}
                    <div className='flex-1 overflow-y-auto'>

                        {/* ── Generate section ── */}
                        <div className='p-4 border-b border-border space-y-3'>
                            {/* Content preview */}
                            <div className='rounded-lg bg-muted/50 border border-border px-3 py-2.5'>
                                <p className='text-xs text-muted-foreground mb-1 font-medium'>
                                    AI sẽ phân tích mô tả hiện tại:
                                </p>
                                {contentPreview ? (
                                    <p className='text-xs text-foreground leading-relaxed line-clamp-2'>
                                        {contentPreview}
                                    </p>
                                ) : (
                                    <p className='text-xs text-muted-foreground italic'>
                                        Chưa có mô tả — hãy nhập vào form trước.
                                    </p>
                                )}
                            </div>

                            {/* Buttons */}
                            {!hasResult ? (
                                <Button
                                    type='button'
                                    size='sm'
                                    className='w-full gap-2'
                                    onClick={handleGenerate}
                                    disabled={isLoading || !currentContent.trim()}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className='h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin' />
                                            Đang tạo gợi ý...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={14} />
                                            Tạo với AI
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    type='button'
                                    size='sm'
                                    variant='outline'
                                    className='w-full gap-2'
                                    onClick={handleRegenerate}
                                    disabled={isLoading || !currentContent.trim()}
                                >
                                    <RefreshCw size={14} className={cn(isLoading && 'animate-spin')} />
                                    Tạo lại
                                </Button>
                            )}
                        </div>

                        {/* ── Loading skeleton ── */}
                        {isLoading && (
                            <div className='p-4 space-y-4'>
                                <div className='flex gap-2'>
                                    {[60, 80, 50].map((w, i) => (
                                        <Skeleton key={i} className={`h-7 w-${w} rounded-full`} />
                                    ))}
                                </div>
                                <Skeleton className='h-16 w-full rounded-lg' />
                                <div className='flex flex-wrap gap-1.5'>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <Skeleton key={i} className='h-6 w-16 rounded-full' />
                                    ))}
                                </div>
                                <div className='grid grid-cols-2 gap-2'>
                                    <Skeleton className='h-10 rounded-lg' />
                                    <Skeleton className='h-10 rounded-lg' />
                                </div>
                            </div>
                        )}

                        {/* ── Results ── */}
                        {!isLoading && hasResult && suggestion && (
                            <div className='p-4 space-y-4'>
                                {/* Safety notes */}
                                {suggestion.safety_notes && (
                                    <div className='flex gap-2 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-800'>
                                        <AlertTriangle size={13} className='shrink-0 mt-0.5' />
                                        <p>{suggestion.safety_notes}</p>
                                    </div>
                                )}

                                {/* Caption type tabs */}
                                <div>
                                    <p className='text-xs text-muted-foreground font-medium mb-2'>Chọn loại caption</p>
                                    <div className='flex gap-1 bg-muted rounded-lg p-1 mb-3'>
                                        {CAPTION_TYPES.map(tab => (
                                            <button
                                                key={tab.key}
                                                type='button'
                                                onClick={() => setActiveCaption(tab.key as typeof activeCaption)}
                                                className={cn(
                                                    'flex-1 text-xs font-medium py-1.5 rounded-md transition-all',
                                                    activeCaption === tab.key
                                                        ? 'bg-background text-foreground shadow-sm'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                )}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Caption display */}
                                    <div className='relative rounded-lg bg-muted/50 border border-border p-3 min-h-[72px]'>
                                        <p className='text-sm leading-relaxed pr-8'>
                                            {captionText || <span className='text-muted-foreground italic text-xs'>Không có caption</span>}
                                        </p>
                                        {captionText && (
                                            <button
                                                type='button'
                                                onClick={handleCopyCaption}
                                                className='absolute top-2 right-2 p-1.5 rounded-md hover:bg-background text-muted-foreground transition-colors'
                                            >
                                                {copiedCaption ? <Check size={13} className='text-green-500' /> : <Copy size={13} />}
                                            </button>
                                        )}
                                        {captionText && (
                                            <p className='text-xs text-muted-foreground mt-1.5'>{captionText.length} ký tự</p>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                {/* Hashtag chips */}
                                {suggestion.hashtags.length > 0 && (
                                    <div className='space-y-2'>
                                        <div className='flex items-center justify-between'>
                                            <p className='text-xs text-muted-foreground font-medium'>
                                                Chọn hashtag ({selectedTags.size}/{suggestion.hashtags.length})
                                            </p>
                                            <div className='flex gap-2'>
                                                <button
                                                    type='button'
                                                    onClick={handleSelectAllTags}
                                                    className='text-xs text-primary hover:underline'
                                                >
                                                    Chọn tất cả
                                                </button>
                                                <span className='text-muted-foreground'>·</span>
                                                <button
                                                    type='button'
                                                    onClick={handleDeselectAllTags}
                                                    className='text-xs text-muted-foreground hover:text-foreground'
                                                >
                                                    Bỏ chọn
                                                </button>
                                            </div>
                                        </div>
                                        <div className='flex flex-wrap gap-1.5'>
                                            {suggestion.hashtags.map(tag => (
                                                <button
                                                    key={tag}
                                                    type='button'
                                                    onClick={() => handleToggleTag(tag)}
                                                    className={cn(
                                                        'text-xs px-2.5 py-1 rounded-full border transition-all',
                                                        selectedTags.has(tag)
                                                            ? 'bg-primary text-primary-foreground border-primary'
                                                            : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                                                    )}
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <Separator />

                                {/* Metadata */}
                                <div className='grid grid-cols-2 gap-2 text-xs'>
                                    <div className='rounded-lg bg-muted/50 border border-border p-2.5'>
                                        <p className='text-muted-foreground mb-0.5'>Danh mục</p>
                                        <p className='font-medium truncate'>{suggestion.category_suggestion ?? '—'}</p>
                                    </div>
                                    <div className='rounded-lg bg-muted/50 border border-border p-2.5'>
                                        <p className='text-muted-foreground mb-0.5'>Mục đích</p>
                                        <p className='font-medium capitalize'>{suggestion.content_intent ?? '—'}</p>
                                    </div>
                                    <div className='col-span-2 rounded-lg bg-muted/50 border border-border p-2.5'>
                                        <p className='text-muted-foreground mb-0.5'>Đối tượng</p>
                                        <p className='font-medium leading-snug line-clamp-2'>{suggestion.target_audience ?? '—'}</p>
                                    </div>
                                </div>

                                {/* Confidence bar */}
                                <div className='space-y-1'>
                                    <div className='flex justify-between text-xs text-muted-foreground'>
                                        <span>Độ tin cậy AI</span>
                                        <span>{confidencePct}%</span>
                                    </div>
                                    <div className='h-1.5 w-full bg-muted rounded-full overflow-hidden'>
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all duration-500',
                                                confidencePct >= 70 ? 'bg-green-500'
                                                    : confidencePct >= 40 ? 'bg-yellow-500'
                                                    : 'bg-red-400'
                                            )}
                                            style={{ width: `${confidencePct}%` }}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                {/* Apply button */}
                                <Button
                                    type='button'
                                    size='sm'
                                    className='w-full gap-2'
                                    onClick={handleApplyToForm}
                                    disabled={!captionText}
                                >
                                    <CheckCircle2 size={14} />
                                    Áp dụng vào bài đăng
                                    {selectedTags.size > 0 && (
                                        <span className='text-xs opacity-75'>
                                            + {selectedTags.size} hashtag
                                        </span>
                                    )}
                                </Button>

                                <p className='text-xs text-center text-muted-foreground'>
                                    Caption + hashtag đã chọn sẽ được điền vào ô mô tả
                                </p>
                            </div>
                        )}

                        {/* ── Empty state ── */}
                        {!isLoading && !hasResult && (
                            <div className='flex flex-col items-center gap-3 py-10 px-6 text-center text-muted-foreground'>
                                <Sparkles size={32} className='opacity-20' />
                                <div>
                                    <p className='text-sm font-medium text-foreground'>Tạo nội dung với AI</p>
                                    <p className='text-xs mt-1 leading-relaxed'>
                                        Nhập mô tả video vào form, sau đó nhấn{' '}
                                        <span className='font-medium text-primary'>Tạo với AI</span>{' '}
                                        để nhận gợi ý caption và hashtag.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
