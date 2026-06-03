'use client'

import { useState } from 'react'
import { Shield, X, Minus, Sparkles, RefreshCw, CheckCircle2, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useParseNLRuleMutation, useCreateRuleMutation } from '@/store/services/wellness-rule.service'
import { WELLNESS_RULE_TYPE_LABELS, WELLNESS_ACTION_LABELS } from '@/constants/wellness'
import type { ParsedRulePreview } from '@/types/models/screen-time.model'

type Mode = 'chat' | 'manual'
type RuleTypeValue = 'continuous_usage' | 'daily_limit' | 'video_watch_time' | 'late_night'
type ActionTypeValue = 'warning' | 'soft_block'

interface ManualForm {
    type: RuleTypeValue
    minutes: number
    action: ActionTypeValue
    title: string
    message: string
}

const defaultManual: ManualForm = {
    type: 'continuous_usage',
    minutes: 60,
    action: 'warning',
    title: '',
    message: ''
}

export function WellnessRuleChat() {
    const t = useTranslations('SnapiStudio.wellness.ruleChat')

    const [isOpen, setIsOpen] = useState(false)
    const [isMinimised, setIsMinimised] = useState(false)
    const [mode, setMode] = useState<Mode>('chat')
    const [nlText, setNlText] = useState('')
    const [preview, setPreview] = useState<ParsedRulePreview | null>(null)
    const [manual, setManual] = useState<ManualForm>(defaultManual)

    const [parseNLRule, { isLoading: isParsing }] = useParseNLRuleMutation()
    const [createRule, { isLoading: isCreating }] = useCreateRuleMutation()

    const RULE_TYPES: { value: RuleTypeValue; label: string }[] = [
        { value: 'continuous_usage', label: t('types.continuous_usage') },
        { value: 'daily_limit', label: t('types.daily_limit') },
        { value: 'video_watch_time', label: t('types.video_watch_time') },
        { value: 'late_night', label: t('types.late_night') }
    ]

    const ACTIONS: { value: ActionTypeValue; label: string }[] = [
        { value: 'warning', label: t('actions.warning') },
        { value: 'soft_block', label: t('actions.soft_block') }
    ]

    const QUICK_PROMPTS = t.raw('quickPrompts') as string[]

    const handleParse = async (text: string) => {
        const input = (text || nlText).trim()
        if (!input) return
        if (text) setNlText(text)
        try {
            const res = await parseNLRule({ text: input }).unwrap()
            setPreview(res.data)
        } catch {
            toast.error(t('errorParse'))
        }
    }

    const handleSavePreview = async () => {
        if (!preview) return
        try {
            await createRule({
                type: preview.type,
                conditions: preview.conditions,
                action: preview.action,
                title: preview.title,
                message: preview.message,
                natural_language_input: nlText
            }).unwrap()
            toast.success(t('toastSaved'))
            setPreview(null)
            setNlText('')
        } catch {
            toast.error(t('errorSave'))
        }
    }

    const handleSaveManual = async () => {
        if (!manual.title.trim()) { toast.error(t('errorTitle')); return }
        try {
            await createRule({
                type: manual.type,
                conditions: { minutes: manual.minutes },
                action: manual.action,
                title: manual.title,
                message: manual.message
            }).unwrap()
            toast.success(t('toastSaved'))
            setManual(defaultManual)
        } catch {
            toast.error(t('errorSave'))
        }
    }

    const fmt = (m: number) =>
        m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? `${m % 60}m` : ''}` : `${m}m`

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className='fixed bottom-6 left-6 z-40 flex items-center justify-center
                           size-12 rounded-full bg-emerald-600 text-white shadow-lg
                           hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95'
                aria-label={t('title')}
            >
                <Shield className='size-5' />
            </button>
        )
    }

    return (
        <div className={cn(
            'fixed bottom-6 left-6 z-40 flex flex-col rounded-2xl',
            'border border-border bg-background shadow-2xl w-[360px] transition-all',
            isMinimised ? 'h-12 overflow-hidden' : 'max-h-[580px]'
        )}>
            {/* Header */}
            <div className='flex items-center justify-between px-4 py-3 border-b border-border shrink-0'>
                <div className='flex items-center gap-2'>
                    <Shield className='size-4 text-emerald-500' />
                    <span className='text-sm font-semibold'>{t('title')}</span>
                </div>
                <div className='flex items-center gap-0.5'>
                    <Button variant='ghost' size='icon' className='size-7' onClick={() => setIsMinimised(v => !v)}>
                        <Minus className='size-3.5' />
                    </Button>
                    <Button variant='ghost' size='icon' className='size-7' onClick={() => setIsOpen(false)}>
                        <X className='size-3.5' />
                    </Button>
                </div>
            </div>

            {!isMinimised && (
                <div className='flex-1 overflow-y-auto scrollbar-hidden'>
                    {/* Mode tabs */}
                    <div className='flex border-b border-border shrink-0'>
                        {([
                            ['chat',   <Sparkles key='s' className='size-3.5' />,          t('modeAI')],
                            ['manual', <SlidersHorizontal key='m' className='size-3.5' />, t('modeManual')]
                        ] as [Mode, React.ReactNode, string][]).map(([key, icon, label]) => (
                            <button key={key} onClick={() => setMode(key)}
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors',
                                    mode === key
                                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                                )}
                            >
                                {icon}{label}
                            </button>
                        ))}
                    </div>

                    {/* ── AI Prompt mode ── */}
                    {mode === 'chat' && (
                        <div className='p-4 space-y-3'>
                            <p className='text-xs text-muted-foreground'>{t('aiHint')}</p>

                            <div className='flex flex-wrap gap-1.5'>
                                {QUICK_PROMPTS.map(p => (
                                    <button key={p} onClick={() => handleParse(p)} disabled={isParsing}
                                        className='rounded-full border border-border px-2.5 py-0.5 text-[11px]
                                                   text-foreground hover:bg-muted transition-colors disabled:opacity-50'>
                                        {p}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={nlText}
                                onChange={e => setNlText(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleParse(nlText) }}}
                                placeholder={t('aiPlaceholder')}
                                rows={3}
                                className='w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm
                                           text-foreground placeholder:text-muted-foreground
                                           resize-none outline-none focus:ring-1 focus:ring-primary/50'
                            />

                            <Button onClick={() => handleParse(nlText)} disabled={!nlText.trim() || isParsing}
                                size='sm' className='w-full gap-2'>
                                {isParsing ? <RefreshCw className='size-3.5 animate-spin' /> : <Sparkles className='size-3.5' />}
                                {isParsing ? t('analyzing') : t('analyzeBtn')}
                            </Button>

                            {preview && (
                                <div className='rounded-xl border border-emerald-500/30
                                                bg-emerald-50 dark:bg-emerald-950/25 p-3 space-y-2'>
                                    <div className='flex items-center gap-2 flex-wrap'>
                                        <Badge variant='secondary' className='text-[10px]'>
                                            {WELLNESS_RULE_TYPE_LABELS[preview.type]}
                                        </Badge>
                                        <Badge variant='outline' className='text-[10px]'>
                                            {WELLNESS_ACTION_LABELS[preview.action]}
                                        </Badge>
                                        <span className='text-[10px] text-muted-foreground ml-auto'>
                                            {t('confidencePct', { pct: Math.round(preview.confidence * 100) })}
                                        </span>
                                    </div>
                                    <p className='text-sm font-semibold text-foreground'>{preview.title}</p>
                                    <p className='text-xs text-muted-foreground'>{preview.message}</p>
                                    <div className='flex gap-2 pt-0.5'>
                                        <Button size='sm'
                                            className='flex-1 h-7 text-xs bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600'
                                            onClick={handleSavePreview} disabled={isCreating}>
                                            <CheckCircle2 className='size-3 mr-1' />
                                            {isCreating ? t('saving') : t('saveRule')}
                                        </Button>
                                        <Button size='sm' variant='outline' className='h-7 text-xs'
                                            onClick={() => setPreview(null)}>
                                            <X className='size-3 mr-1' />{t('dismiss')}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Manual mode ── */}
                    {mode === 'manual' && (
                        <div className='p-4 space-y-3'>
                            <div>
                                <label className='text-xs font-medium text-muted-foreground mb-1.5 block'>{t('ruleType')}</label>
                                <div className='grid grid-cols-2 gap-1.5'>
                                    {RULE_TYPES.map(rt => (
                                        <button key={rt.value} onClick={() => setManual(m => ({ ...m, type: rt.value }))}
                                            className={cn(
                                                'rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors text-left',
                                                manual.type === rt.value
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-600'
                                                    : 'border-border text-muted-foreground hover:bg-muted'
                                            )}>
                                            {rt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className='text-xs font-medium text-muted-foreground mb-1 block'>{t('duration')}</label>
                                <div className='flex items-center gap-3'>
                                    <input type='range' min={10} max={240} step={5} value={manual.minutes}
                                        onChange={e => setManual(m => ({ ...m, minutes: +e.target.value }))}
                                        className='flex-1 accent-emerald-600' />
                                    <span className='text-sm font-semibold tabular-nums w-12 text-right text-foreground'>
                                        {fmt(manual.minutes)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className='text-xs font-medium text-muted-foreground mb-1.5 block'>{t('action')}</label>
                                <div className='grid grid-cols-2 gap-1.5'>
                                    {ACTIONS.map(a => (
                                        <button key={a.value} onClick={() => setManual(m => ({ ...m, action: a.value }))}
                                            className={cn(
                                                'rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors',
                                                manual.action === a.value
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-600'
                                                    : 'border-border text-muted-foreground hover:bg-muted'
                                            )}>
                                            {a.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className='text-xs font-medium text-muted-foreground mb-1 block'>{t('titleRequired')}</label>
                                <input type='text' value={manual.title}
                                    onChange={e => setManual(m => ({ ...m, title: e.target.value }))}
                                    placeholder={t('titlePlaceholder')}
                                    className='w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm
                                               text-foreground placeholder:text-muted-foreground
                                               outline-none focus:ring-1 focus:ring-primary/50' />
                            </div>

                            <div>
                                <label className='text-xs font-medium text-muted-foreground mb-1 block'>{t('messageLabel')}</label>
                                <input type='text' value={manual.message}
                                    onChange={e => setManual(m => ({ ...m, message: e.target.value }))}
                                    placeholder={t('messagePlaceholder')}
                                    className='w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm
                                               text-foreground placeholder:text-muted-foreground
                                               outline-none focus:ring-1 focus:ring-primary/50' />
                            </div>

                            <Button onClick={handleSaveManual} disabled={isCreating || !manual.title.trim()}
                                size='sm' className='w-full gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600'>
                                <CheckCircle2 className='size-3.5' />
                                {isCreating ? t('saving') : t('saveRule')}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
