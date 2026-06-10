'use client'

import { useState } from 'react'
import { Shield, X, Minus, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useCreateRuleMutation } from '@/store/services/wellness-rule.service'

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
    const [manual, setManual] = useState<ManualForm>(defaultManual)

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

    const handleSaveManual = async () => {
        if (!manual.title.trim()) {
            toast.error(t('errorTitle'))
            return
        }
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

    const fmt = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? `${m % 60}m` : ''}` : `${m}m`)

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
        <div
            className={cn(
                'fixed bottom-6 left-6 z-40 flex flex-col rounded-2xl',
                'border border-border bg-background shadow-2xl w-[360px] transition-all',
                isMinimised ? 'h-12 overflow-hidden' : 'max-h-[580px]'
            )}
        >
            {/* Header */}
            <div className='flex items-center justify-between px-4 py-3 border-b border-border shrink-0'>
                <div className='flex items-center gap-2'>
                    <Shield className='size-4 text-emerald-500' />
                    <span className='text-sm font-semibold'>{t('title')}</span>
                </div>
                <div className='flex items-center gap-0.5'>
                    <Button variant='ghost' size='icon' className='size-7' onClick={() => setIsMinimised((v) => !v)}>
                        <Minus className='size-3.5' />
                    </Button>
                    <Button variant='ghost' size='icon' className='size-7' onClick={() => setIsOpen(false)}>
                        <X className='size-3.5' />
                    </Button>
                </div>
            </div>

            {!isMinimised && (
                <div className='flex-1 overflow-y-auto scrollbar-hidden'>
                    <div className='p-4 space-y-3'>
                        <div>
                            <label className='text-xs font-medium text-muted-foreground mb-1.5 block'>
                                {t('ruleType')}
                            </label>
                            <div className='grid grid-cols-2 gap-1.5'>
                                {RULE_TYPES.map((rt) => (
                                    <button
                                        key={rt.value}
                                        onClick={() => setManual((m) => ({ ...m, type: rt.value }))}
                                        className={cn(
                                            'rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors text-left',
                                            manual.type === rt.value
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-600'
                                                : 'border-border text-muted-foreground hover:bg-muted'
                                        )}
                                    >
                                        {rt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className='text-xs font-medium text-muted-foreground mb-1 block'>
                                {t('duration')}
                            </label>
                            <div className='flex items-center gap-3'>
                                <input
                                    type='range'
                                    min={10}
                                    max={240}
                                    step={5}
                                    value={manual.minutes}
                                    onChange={(e) => setManual((m) => ({ ...m, minutes: +e.target.value }))}
                                    className='flex-1 accent-emerald-600'
                                />
                                <span className='text-sm font-semibold tabular-nums w-12 text-right text-foreground'>
                                    {fmt(manual.minutes)}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className='text-xs font-medium text-muted-foreground mb-1.5 block'>
                                {t('action')}
                            </label>
                            <div className='grid grid-cols-2 gap-1.5'>
                                {ACTIONS.map((a) => (
                                    <button
                                        key={a.value}
                                        onClick={() => setManual((m) => ({ ...m, action: a.value }))}
                                        className={cn(
                                            'rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors',
                                            manual.action === a.value
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-600'
                                                : 'border-border text-muted-foreground hover:bg-muted'
                                        )}
                                    >
                                        {a.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className='text-xs font-medium text-muted-foreground mb-1 block'>
                                {t('titleRequired')}
                            </label>
                            <input
                                type='text'
                                value={manual.title}
                                onChange={(e) => setManual((m) => ({ ...m, title: e.target.value }))}
                                placeholder={t('titlePlaceholder')}
                                className='w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm
                                               text-foreground placeholder:text-muted-foreground
                                               outline-none focus:ring-1 focus:ring-primary/50'
                            />
                        </div>

                        <div>
                            <label className='text-xs font-medium text-muted-foreground mb-1 block'>
                                {t('messageLabel')}
                            </label>
                            <input
                                type='text'
                                value={manual.message}
                                onChange={(e) => setManual((m) => ({ ...m, message: e.target.value }))}
                                placeholder={t('messagePlaceholder')}
                                className='w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm
                                               text-foreground placeholder:text-muted-foreground
                                               outline-none focus:ring-1 focus:ring-primary/50'
                            />
                        </div>

                        <Button
                            onClick={handleSaveManual}
                            disabled={isCreating || !manual.title.trim()}
                            size='sm'
                            className='w-full gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600'
                        >
                            <CheckCircle2 className='size-3.5' />
                            {isCreating ? t('saving') : t('saveRule')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
