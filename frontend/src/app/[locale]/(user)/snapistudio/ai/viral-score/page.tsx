'use client'

import { useState, useEffect, useRef } from 'react'
import { Zap, TrendingUp, AlertCircle, CheckCircle2, Copy, Check, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAnalyzeViralScoreMutation, useGetViralScoreQuery, VIRAL_SCORE_POLL_INTERVAL_MS } from '@/store/services/ai-viral-score.service'
import type { AiViralScoreType, ViralScoreLevel } from '@/types/models/ai-viral-score.model'


const LEVEL_COLORS: Record<ViralScoreLevel, string> = {
    low:    'text-red-500    bg-red-50    border-red-200    dark:bg-red-950/30',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30',
    high:   'text-blue-500   bg-blue-50   border-blue-200   dark:bg-blue-950/30',
    viral:  'text-green-600  bg-green-50  border-green-200  dark:bg-green-950/30',
}

const BREAKDOWN_LABELS: Record<string, string> = {
    hook_strength:      'Hook Strength',
    hashtag_quality:    'Hashtag Quality',
    audience_clarity:   'Audience Clarity',
    engagement_trigger: 'Engagement Trigger',
    format_fit:         'Format Fit',
}


export default function ViralScorePage() {
    const [caption,    setCaption]    = useState('')
    const [hashtagStr, setHashtagStr] = useState('')
    const [scoreUuid,  setScoreUuid]  = useState<string | null>(null)
    const [copied,     setCopied]     = useState<string | null>(null)
    const isPolling                   = useRef(false)

    const [analyzeScore, { isLoading: isAnalyzing }] = useAnalyzeViralScoreMutation()

    const { data: pollData } = useGetViralScoreQuery(scoreUuid ?? '', {
        skip:            !scoreUuid || !isPolling.current,
        pollingInterval: isPolling.current ? VIRAL_SCORE_POLL_INTERVAL_MS : 0,
    })

    const score = pollData?.data ?? null

    useEffect(() => {
        if (score && (score.status === 'completed' || score.status === 'failed')) {
            isPolling.current = false
            if (score.status === 'completed') toast.success('Phân tích hoàn thành!')
            else toast.error('Phân tích thất bại. Vui lòng thử lại.')
        }
    }, [score?.status])

    const handleAnalyze = async () => {
        if (!caption.trim()) return

        const hashtags = hashtagStr
            .split(/[\s,]+/)
            .filter(Boolean)
            .map(h => h.startsWith('#') ? h : `#${h}`)

        const res = await analyzeScore({ caption: caption.trim(), hashtags }).unwrap()
        setScoreUuid(res.data.uuid)
        isPolling.current = true
    }

    const handleCopy = async (text: string, key: string) => {
        await navigator.clipboard.writeText(text)
        setCopied(key)
        toast.success('Copied!')
        setTimeout(() => setCopied(null), 2000)
    }

    const isLoading = isAnalyzing || (isPolling.current && score?.status !== 'completed')

    return (
        <div className='max-w-2xl mx-auto p-4 space-y-6'>
            <div className='flex items-center gap-2'>
                <div className='flex size-8 items-center justify-center rounded-lg bg-primary/10'>
                    <Zap size={16} className='text-primary' />
                </div>
                <div>
                    <h1 className='text-lg font-semibold'>AI Viral Score</h1>
                    <p className='text-xs text-muted-foreground'>Phân tích tiềm năng viral của caption và hashtag</p>
                </div>
            </div>

            {/* Input form */}
            <div className='rounded-xl border border-border bg-card p-4 space-y-3'>
                <div className='space-y-1'>
                    <label className='text-xs font-medium text-muted-foreground'>Caption *</label>
                    <textarea
                        value={caption}
                        onChange={e => setCaption(e.target.value)}
                        placeholder='Nhập caption video của bạn...'
                        rows={4}
                        className='w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm resize-none outline-none focus:ring-1 focus:ring-primary/50'
                    />
                </div>
                <div className='space-y-1'>
                    <label className='text-xs font-medium text-muted-foreground'>Hashtags (phân cách bằng dấu cách hoặc phẩy)</label>
                    <input
                        type='text'
                        value={hashtagStr}
                        onChange={e => setHashtagStr(e.target.value)}
                        placeholder='#fyp #viral #trending ...'
                        className='w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/50'
                    />
                </div>
                <Button
                    onClick={handleAnalyze}
                    disabled={!caption.trim() || isLoading}
                    className='w-full gap-2'
                >
                    {isLoading
                        ? <><RefreshCw size={14} className='animate-spin' /> Đang phân tích...</>
                        : <><Zap size={14} /> Phân tích Viral Score</>
                    }
                </Button>
            </div>

            {/* Loading state */}
            {isLoading && !score?.overall_score && (
                <div className='rounded-xl border border-border bg-card p-4 space-y-3'>
                    <Skeleton className='h-20 w-full rounded-lg' />
                    <div className='grid grid-cols-2 gap-2'>
                        {[1,2,3,4,5].map(i => <Skeleton key={i} className='h-12 rounded-lg' />)}
                    </div>
                </div>
            )}

            {/* Results */}
            {score && score.status === 'completed' && (
                <div className='space-y-4'>
                    {/* Score hero */}
                    <div className={cn(
                        'rounded-xl border p-6 text-center space-y-2',
                        score.level ? LEVEL_COLORS[score.level] : 'bg-card border-border'
                    )}>
                        <p className='text-5xl font-bold'>{Math.round(score.overall_score ?? 0)}</p>
                        <p className='text-sm font-medium'>/ 100 — {score.level_label}</p>
                    </div>

                    {/* Breakdown */}
                    {score.breakdown && (
                        <div className='rounded-xl border border-border bg-card p-4 space-y-3'>
                            <p className='text-sm font-semibold'>Phân tích chi tiết</p>
                            {Object.entries(score.breakdown).map(([key, val]) => (
                                <div key={key} className='space-y-1'>
                                    <div className='flex justify-between text-xs text-muted-foreground'>
                                        <span>{BREAKDOWN_LABELS[key] ?? key}</span>
                                        <span>{Math.round(val as number)}/100</span>
                                    </div>
                                    <div className='h-2 w-full bg-muted rounded-full overflow-hidden'>
                                        <div
                                            className='h-full bg-primary rounded-full transition-all duration-500'
                                            style={{ width: `${val}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Strengths & Weaknesses */}
                    {(score.strengths.length > 0 || score.weaknesses.length > 0) && (
                        <div className='grid grid-cols-2 gap-3'>
                            {score.strengths.length > 0 && (
                                <div className='rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/30 p-3 space-y-2'>
                                    <p className='text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1'>
                                        <CheckCircle2 size={12} /> Điểm mạnh
                                    </p>
                                    <ul className='space-y-1'>
                                        {score.strengths.map((s, i) => (
                                            <li key={i} className='text-xs text-green-800 dark:text-green-300'>• {s}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {score.weaknesses.length > 0 && (
                                <div className='rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 p-3 space-y-2'>
                                    <p className='text-xs font-semibold text-red-700 dark:text-red-400 flex items-center gap-1'>
                                        <AlertCircle size={12} /> Điểm yếu
                                    </p>
                                    <ul className='space-y-1'>
                                        {score.weaknesses.map((w, i) => (
                                            <li key={i} className='text-xs text-red-800 dark:text-red-300'>• {w}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Recommendations */}
                    {score.recommendations.length > 0 && (
                        <div className='rounded-xl border border-border bg-card p-3 space-y-2'>
                            <p className='text-xs font-semibold flex items-center gap-1'>
                                <TrendingUp size={12} /> Đề xuất cải thiện
                            </p>
                            <ul className='space-y-1'>
                                {score.recommendations.map((r, i) => (
                                    <li key={i} className='text-xs text-muted-foreground'>→ {r}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Improved caption */}
                    {score.improved_caption && (
                        <div className='rounded-xl border border-border bg-card p-3 space-y-2'>
                            <div className='flex items-center justify-between'>
                                <p className='text-xs font-semibold'>Caption cải thiện</p>
                                <button
                                    type='button'
                                    onClick={() => handleCopy(score.improved_caption!, 'improved')}
                                    className='text-muted-foreground hover:text-foreground'
                                >
                                    {copied === 'improved'
                                        ? <Check size={13} className='text-green-500' />
                                        : <Copy size={13} />
                                    }
                                </button>
                            </div>
                            <p className='text-sm leading-relaxed'>{score.improved_caption}</p>
                        </div>
                    )}

                    {/* Suggested hashtags */}
                    {score.suggested_hashtags.length > 0 && (
                        <div className='flex flex-wrap gap-1.5'>
                            {score.suggested_hashtags.map(tag => (
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
        </div>
    )
}
