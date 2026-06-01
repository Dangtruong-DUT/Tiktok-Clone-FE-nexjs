'use client'

import { useState, useCallback } from 'react'
import { Sparkles, X, ChevronDown, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAiContentSuggestion } from '@/hooks/studio/useAiContentSuggestion'
import { AiContentSuggestionType } from '@/types/models/ai-content-suggestion.model'
import { GenerateAiSuggestionReqBodyType } from '@/types/dtos/ai/ai-content-suggestion.dto'
import { AiInputPanel } from './AiInputPanel'
import { AiCaptionTabs } from './AiCaptionTabs'
import { AiHashtagChips } from './AiHashtagChips'
import { AiSuggestionSkeleton } from './AiSuggestionSkeleton'

interface AiFloatingChatProps {
    /** Current form title value to pre-fill */
    initialTitle?: string
    /** Current form description value to pre-fill */
    initialDescription?: string
    /** Called when user clicks "Use this" on a caption — inject into parent form */
    onCaptionSelect?: (caption: string) => void
    /** Called when user clicks Apply — full suggestion data injected into parent form */
    onApplied?: (suggestion: AiContentSuggestionType) => void
}

export function AiFloatingChat({ initialTitle, initialDescription, onCaptionSelect, onApplied }: AiFloatingChatProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isInputCollapsed, setIsInputCollapsed] = useState(false)

    const { suggestion, isGenerating, isCompleted, isFailed, isApplying, generate, regenerate, apply } =
        useAiContentSuggestion({ onApplied })

    const hasResult = !!(isCompleted || isFailed) && !!suggestion

    const handleGenerate = useCallback(
        (data: GenerateAiSuggestionReqBodyType) => {
            generate(data)
            setIsInputCollapsed(true)
        },
        [generate]
    )

    const handleRegenerate = useCallback(
        (data: GenerateAiSuggestionReqBodyType) => {
            regenerate(data)
            setIsInputCollapsed(true)
        },
        [regenerate]
    )

    const confidencePct = Math.round((suggestion?.confidence_score ?? 0) * 100)

    return (
        <>
            {/* Floating trigger button */}
            <button
                type='button'
                onClick={() => setIsOpen((prev) => !prev)}
                className={cn(
                    'fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 shadow-lg',
                    'bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200',
                    'text-sm font-medium',
                    isOpen && 'ring-2 ring-primary/30 ring-offset-2'
                )}
                aria-label='AI Content Studio'
            >
                <Sparkles size={16} className={cn('transition-transform', isGenerating && 'animate-pulse')} />
                <span>AI Studio</span>
                {isGenerating && <span className='h-2 w-2 rounded-full bg-yellow-300 animate-pulse' />}
                {isCompleted && !isGenerating && <span className='h-2 w-2 rounded-full bg-green-400' />}
            </button>

            {/* Floating panel */}
            {isOpen && (
                <div
                    className={cn(
                        'fixed bottom-20 right-6 z-50 w-[380px] max-h-[85vh]',
                        'rounded-2xl border border-border bg-background shadow-2xl',
                        'flex flex-col overflow-hidden',
                        'animate-in slide-in-from-bottom-4 fade-in duration-200'
                    )}
                >
                    {/* Header */}
                    <div className='flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30'>
                        <div className='flex items-center gap-2'>
                            <Sparkles size={15} className='text-primary' />
                            <span className='text-sm font-semibold'>AI Content Studio</span>
                            {isGenerating && (
                                <Badge variant='secondary' className='text-xs animate-pulse'>
                                    Generating...
                                </Badge>
                            )}
                            {isCompleted && (
                                <Badge variant='secondary' className='text-xs text-green-600 bg-green-50'>
                                    <CheckCircle2 size={10} className='mr-1' />
                                    Ready
                                </Badge>
                            )}
                            {isFailed && (
                                <Badge variant='destructive' className='text-xs'>
                                    <AlertTriangle size={10} className='mr-1' />
                                    Fallback
                                </Badge>
                            )}
                        </div>
                        <button
                            type='button'
                            onClick={() => setIsOpen(false)}
                            className='p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground'
                        >
                            <X size={15} />
                        </button>
                    </div>

                    {/* Scrollable content */}
                    <div className='flex-1 overflow-y-auto'>
                        {/* Input panel with collapse toggle */}
                        <div>
                            {hasResult && (
                                <button
                                    type='button'
                                    onClick={() => setIsInputCollapsed((v) => !v)}
                                    className='w-full flex items-center justify-between px-4 py-2 text-xs text-muted-foreground hover:bg-muted/50 transition-colors border-b border-border'
                                >
                                    <span>Video information</span>
                                    <ChevronDown
                                        size={14}
                                        className={cn(
                                            'transition-transform duration-200',
                                            !isInputCollapsed && 'rotate-180'
                                        )}
                                    />
                                </button>
                            )}

                            {!isInputCollapsed && (
                                <AiInputPanel
                                    initialTitle={initialTitle}
                                    initialDescription={initialDescription}
                                    isGenerating={isGenerating}
                                    hasResult={hasResult}
                                    onGenerate={handleGenerate}
                                    onRegenerate={handleRegenerate}
                                />
                            )}
                        </div>

                        {/* Loading skeleton */}
                        {isGenerating && <AiSuggestionSkeleton />}

                        {/* Suggestion results */}
                        {!isGenerating && hasResult && suggestion && (
                            <div className='space-y-4 p-4'>
                                {/* Safety notes alert */}
                                {suggestion.safety_notes && (
                                    <div className='flex gap-2 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-800'>
                                        <AlertTriangle size={14} className='shrink-0 mt-0.5' />
                                        <p>{suggestion.safety_notes}</p>
                                    </div>
                                )}

                                {/* Caption tabs */}
                                <AiCaptionTabs suggestion={suggestion} onSelect={onCaptionSelect} />

                                <Separator />

                                {/* Hashtags */}
                                <AiHashtagChips hashtags={suggestion.hashtags} />

                                <Separator />

                                {/* Metadata */}
                                <div className='grid grid-cols-2 gap-2 text-xs'>
                                    <div className='rounded-lg bg-muted/50 border border-border p-2.5 space-y-0.5'>
                                        <p className='text-muted-foreground'>Category</p>
                                        <p className='font-medium truncate'>{suggestion.category_suggestion ?? '—'}</p>
                                    </div>
                                    <div className='rounded-lg bg-muted/50 border border-border p-2.5 space-y-0.5'>
                                        <p className='text-muted-foreground'>Intent</p>
                                        <p className='font-medium capitalize'>{suggestion.content_intent ?? '—'}</p>
                                    </div>
                                    <div className='col-span-2 rounded-lg bg-muted/50 border border-border p-2.5 space-y-0.5'>
                                        <p className='text-muted-foreground'>Target audience</p>
                                        <p className='font-medium leading-snug'>{suggestion.target_audience ?? '—'}</p>
                                    </div>
                                </div>

                                {/* Confidence score */}
                                <div className='space-y-1.5'>
                                    <div className='flex justify-between text-xs text-muted-foreground'>
                                        <span>AI confidence</span>
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

                                <Separator />

                                {/* Apply button */}
                                <Button
                                    type='button'
                                    size='sm'
                                    className='w-full gap-2'
                                    onClick={apply}
                                    disabled={isApplying}
                                >
                                    {isApplying ? (
                                        <>
                                            <span className='h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin' />
                                            Applying...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={14} />
                                            Apply to post
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Empty state */}
                        {!isGenerating && !hasResult && (
                            <div className='flex flex-col items-center gap-3 py-10 px-6 text-center text-muted-foreground'>
                                <Sparkles size={32} className='opacity-30' />
                                <div>
                                    <p className='text-sm font-medium'>Generate with AI</p>
                                    <p className='text-xs mt-1'>
                                        Fill in video info above and click Generate to get captions, hashtags, and more.
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
