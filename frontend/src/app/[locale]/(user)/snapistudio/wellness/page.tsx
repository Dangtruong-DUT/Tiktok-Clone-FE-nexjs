'use client'

import { useState } from 'react'
import {
    HeartPulse, Clock, BarChart2, Shield,
    Brain, Plus, Trash2, ToggleLeft, ToggleRight,
    RefreshCw, CheckCircle2, ChevronDown, ChevronUp, X, Timer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useAppSelector } from '@/store/hooks'
import { useGetStatsQuery } from '@/store/services/screen-time.service'
import {
    useListRulesQuery,
    useCreateRuleMutation,
    useUpdateRuleMutation,
    useDeleteRuleMutation,
    useAnalyzeUsageMutation
} from '@/store/services/wellness-rule.service'
import { WELLNESS_RULE_TYPE_LABELS, WELLNESS_ACTION_LABELS, WELLNESS_PERIODS } from '@/constants/wellness'
import { STUDIO_POST_STATUSES } from '@/constants/studio-post'
import type { WellnessPeriod, WellnessRuleItem } from '@/types/models/screen-time.model'

type RuleTypeValue = 'continuous_usage' | 'daily_limit' | 'video_watch_time' | 'late_night'
type ActionTypeValue = 'warning' | 'soft_block'

interface ManualForm {
    type: RuleTypeValue
    minutes: number
    action: ActionTypeValue
    title: string
    message: string
}

const defaultForm: ManualForm = { type: 'continuous_usage', minutes: 60, action: 'warning', title: '', message: '' }

function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color = '' }: {
    label: string; value: string | number; icon: React.ElementType; color?: string
}) {
    return (
        <div className='rounded-xl border border-border bg-card p-4 space-y-2'>
            <div className='flex items-center justify-between'>
                <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>{label}</p>
                <Icon size={15} className='text-muted-foreground' />
            </div>
            <p className={cn('text-2xl font-bold text-foreground', color)}>{value}</p>
        </div>
    )
}

// ── Rule progress — counts from rule.created_at ───────────────────────────────
function RuleProgress({ rule }: { rule: import('@/types/models/screen-time.model').WellnessRuleItem }) {
    const threshold = Number(rule.conditions['minutes'] ?? 60)
    if (!rule.is_enabled || rule.type === 'late_night') return null

    let elapsedMinutes = 0

    if (rule.type === 'continuous_usage') {
        // Count from rule creation (same logic as useScreenTimeTracker)
        elapsedMinutes = (Date.now() - new Date(rule.created_at).getTime()) / 60_000
    } else {
        // For daily_limit and video_watch_time keep elapsed = 0 (no created_at reference makes sense)
        return null
    }

    const currentCycle    = Math.floor(elapsedMinutes / threshold)
    const elapsedInCycle  = elapsedMinutes % threshold
    const pct             = Math.min(100, (elapsedInCycle / threshold) * 100)
    const remainingMin    = Math.max(0, Math.ceil(threshold - elapsedInCycle))

    const label = remainingMin === 0
        ? 'Đang kích hoạt…'
        : `Còn ${remainingMin} phút (chu kỳ ${currentCycle + 1})`

    return (
        <div className='mt-2 space-y-1'>
            <div className='flex items-center justify-between'>
                <span className='flex items-center gap-1 text-[10px] text-muted-foreground'>
                    <Timer size={10} />
                    {label}
                </span>
                <span className='text-[10px] text-muted-foreground tabular-nums'>{Math.round(pct)}%</span>
            </div>
            <div className='h-1 w-full rounded-full bg-muted overflow-hidden'>
                <div
                    className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-destructive' : 'bg-primary'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    )
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, action }: {
    icon: React.ElementType; title: string; action?: React.ReactNode
}) {
    return (
        <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
                <div className='flex size-7 items-center justify-center rounded-lg bg-primary/10'>
                    <Icon size={14} className='text-primary' />
                </div>
                <h2 className='text-sm font-semibold text-foreground'>{title}</h2>
            </div>
            {action}
        </div>
    )
}

export default function WellnessPage() {
    const t = useTranslations('SnapiStudio.wellness')
    const [period, setPeriod] = useState<WellnessPeriod>(WELLNESS_PERIODS.TODAY)
    const [addOpen, setAddOpen] = useState(false)
    const [form, setForm] = useState<ManualForm>(defaultForm)

    // Today's live stats from store
    const sessionStartedAt   = useAppSelector(s => s.wellness.sessionStartedAt)
    const todayTotalSeconds  = useAppSelector(s => s.wellness.todayTotalSeconds)
    const todayVideoSeconds  = useAppSelector(s => s.wellness.todayVideoSeconds)
    const elapsedSeconds     = sessionStartedAt ? Math.round((Date.now() - sessionStartedAt) / 1000) : 0
    const totalOnline        = todayTotalSeconds + elapsedSeconds

    // Stats
    const { data: statsData, isLoading: isLoadingStats } = useGetStatsQuery({ period })
    const stats = statsData?.data

    // Rules
    const { data: rulesData, isLoading: isLoadingRules } = useListRulesQuery()
    const [createRule, { isLoading: isCreating }] = useCreateRuleMutation()
    const [updateRule] = useUpdateRuleMutation()
    const [deleteRule] = useDeleteRuleMutation()
    const rules = rulesData?.data ?? []

    // AI Analysis
    const [analyzeUsage, { isLoading: isAnalyzing, data: analysisData }] = useAnalyzeUsageMutation()
    const analysis = analysisData?.data

    const RULE_TYPES: { value: RuleTypeValue; label: string }[] = [
        { value: 'continuous_usage', label: t('ruleChat.types.continuous_usage') },
        { value: 'daily_limit',      label: t('ruleChat.types.daily_limit') },
        { value: 'video_watch_time', label: t('ruleChat.types.video_watch_time') },
        { value: 'late_night',       label: t('ruleChat.types.late_night') },
    ]
    const ACTIONS: { value: ActionTypeValue; label: string }[] = [
        { value: 'warning',    label: t('ruleChat.actions.warning') },
        { value: 'soft_block', label: t('ruleChat.actions.soft_block') },
    ]

    const PERIODS = [
        { value: WELLNESS_PERIODS.TODAY, label: t('stats.periods.today') },
        { value: WELLNESS_PERIODS.WEEK,  label: t('stats.periods.week')  },
        { value: WELLNESS_PERIODS.MONTH, label: t('stats.periods.month') },
    ] as const

    const handleSaveRule = async () => {
        const fmtMin = (m: number) => m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? `${m % 60}m` : ''}` : `${m}m`

        const defaultTitles: Record<RuleTypeValue, string> = {
            continuous_usage: `Dùng liên tục ${fmtMin(form.minutes)}`,
            daily_limit:      `Giới hạn ${fmtMin(form.minutes)}/ngày`,
            video_watch_time: `Xem video ${fmtMin(form.minutes)}`,
            late_night:       'Sử dụng khuya',
        }
        const defaultMessages: Record<RuleTypeValue, string> = {
            continuous_usage: `Bạn đã dùng liên tục ${fmtMin(form.minutes)}. Hãy nghỉ ngơi một chút!`,
            daily_limit:      `Bạn đã đạt ${fmtMin(form.minutes)} hôm nay. Hãy cân bằng thời gian!`,
            video_watch_time: `Bạn đã xem video ${fmtMin(form.minutes)}. Hãy nghỉ mắt!`,
            late_night:       'Đã muộn rồi! Hãy nghỉ ngơi để bảo vệ sức khỏe.',
        }

        const resolvedTitle   = form.title.trim()   || defaultTitles[form.type]
        const resolvedMessage = form.message.trim()  || defaultMessages[form.type]

        try {
            await createRule({
                type:       form.type,
                conditions: { minutes: form.minutes },
                action:     form.action,
                title:      resolvedTitle,
                message:    resolvedMessage,
            }).unwrap()
            toast.success(t('rules.toast.saved'))
            setForm(defaultForm)
            setAddOpen(false)
        } catch {
            toast.error(t('ruleChat.errorSave'))
        }
    }

    const fmtMin = (m: number) =>
        m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? `${m % 60}m` : ''}` : `${m}m`

    return (
        <div className='max-w-2xl mx-auto px-4 py-6 space-y-8'>
            {/* Page header */}
            <div className='flex items-center gap-3'>
                <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10'>
                    <HeartPulse size={20} className='text-primary' />
                </div>
                <div>
                    <h1 className='text-lg font-semibold text-foreground'>{t('title')}</h1>
                    <p className='text-xs text-muted-foreground'>{t('subtitle')}</p>
                </div>
            </div>

            {/* ── Section 1: Today ── */}
            <section className='space-y-3'>
                <SectionHeader icon={Clock} title={t('tabs.today')} />
                <div className='grid grid-cols-2 gap-3'>
                    <StatCard label={t('today.online')} value={formatDuration(totalOnline)} icon={Clock} color='text-primary' />
                    <StatCard label={t('today.watchingVideo')} value={formatDuration(todayVideoSeconds)} icon={HeartPulse} />
                    {stats && <>
                        <StatCard label={t('today.comments')} value={stats.comments_count} icon={BarChart2} />
                        <StatCard label={t('today.posts')}    value={stats.posts_count}    icon={BarChart2} />
                    </>}
                </div>
                {stats?.peak_hour != null && (
                    <p className='text-xs text-muted-foreground text-center'>
                        {t('today.peakHour', { hour: stats.peak_hour, hourEnd: stats.peak_hour + 1 })}
                    </p>
                )}
            </section>

            <Separator />

            {/* ── Section 2: Stats ── */}
            <section className='space-y-3'>
                <SectionHeader icon={BarChart2} title={t('tabs.stats')}
                    action={
                        <div className='flex gap-1'>
                            {PERIODS.map(p => (
                                <button key={p.value} onClick={() => setPeriod(p.value)}
                                    className={cn(
                                        'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                                        period === p.value
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground hover:text-foreground'
                                    )}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    }
                />

                {isLoadingStats ? (
                    <div className='grid grid-cols-2 gap-3'>
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className='h-24 rounded-xl' />)}
                    </div>
                ) : stats ? (
                    <>
                        <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                            <StatCard label={t('stats.totalTime')}  value={formatDuration(stats.total_seconds)}     icon={Clock}      color='text-primary' />
                            <StatCard label={t('stats.watchingVideo')} value={formatDuration(stats.video_seconds)}  icon={HeartPulse} />
                            <StatCard label={t('stats.dailyAvg')}   value={formatDuration(stats.avg_daily_seconds)} icon={BarChart2}  />
                            <StatCard label={t('stats.sessions')}   value={stats.sessions_count}                    icon={Clock}      />
                            <StatCard label={t('stats.comments')}   value={stats.comments_count}                    icon={BarChart2}  />
                            <StatCard label={t('stats.posts')}      value={stats.posts_count}                       icon={BarChart2}  />
                        </div>

                        {stats.daily_series.length > 0 && (
                            <div className='rounded-xl border border-border bg-card p-4'>
                                <p className='text-sm font-semibold mb-3 text-foreground'>{t('stats.chartTitle')}</p>
                                <ResponsiveContainer width='100%' height={180}>
                                    <BarChart data={stats.daily_series} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
                                        <XAxis dataKey='date' tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                                        <YAxis tick={{ fontSize: 10 }} tickFormatter={s => `${Math.round(s / 60)}m`} />
                                        <Tooltip
                                            formatter={(v: number) => [formatDuration(v), t('stats.timeLabel')]}
                                            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                                        />
                                        <Bar dataKey='seconds' fill='hsl(var(--primary))' radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </>
                ) : null}
            </section>

            <Separator />

            {/* ── Section 3: Rules ── */}
            <section className='space-y-4'>
                <SectionHeader icon={Shield} title={t('tabs.rules')}
                    action={
                        <Button size='sm' variant={addOpen ? 'outline' : 'default'} className='h-7 text-xs gap-1'
                            onClick={() => setAddOpen(v => !v)}>
                            {addOpen ? <X size={12} /> : <Plus size={12} />}
                            {addOpen ? t('ruleChat.dismiss') : t('rules.createTitle').split(' ').slice(0, 2).join(' ')}
                        </Button>
                    }
                />

                {/* Inline manual form */}
                {addOpen && (
                    <div className='rounded-xl border border-border bg-card p-4 space-y-3'>
                        {/* Type */}
                        <div>
                            <label className='text-xs font-medium text-muted-foreground mb-1.5 block'>{t('ruleChat.ruleType')}</label>
                            <div className='grid grid-cols-2 gap-1.5'>
                                {RULE_TYPES.map(rt => (
                                    <button key={rt.value} onClick={() => setForm(f => ({ ...f, type: rt.value }))}
                                        className={cn(
                                            'rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors text-left',
                                            form.type === rt.value
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border text-muted-foreground hover:bg-muted'
                                        )}>
                                        {rt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Duration slider */}
                        <div>
                            <label className='text-xs font-medium text-muted-foreground mb-1 block'>{t('ruleChat.duration')}</label>
                            <div className='flex items-center gap-3'>
                                <input type='range' min={10} max={240} step={5} value={form.minutes}
                                    onChange={e => setForm(f => ({ ...f, minutes: +e.target.value }))}
                                    className='flex-1 accent-primary' />
                                <span className='text-sm font-semibold w-12 text-right tabular-nums text-foreground'>
                                    {fmtMin(form.minutes)}
                                </span>
                            </div>
                        </div>

                        {/* Action */}
                        <div>
                            <label className='text-xs font-medium text-muted-foreground mb-1.5 block'>{t('ruleChat.action')}</label>
                            <div className='grid grid-cols-2 gap-1.5'>
                                {ACTIONS.map(a => (
                                    <button key={a.value} onClick={() => setForm(f => ({ ...f, action: a.value }))}
                                        className={cn(
                                            'rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors',
                                            form.action === a.value
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border text-muted-foreground hover:bg-muted'
                                        )}>
                                        {a.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className='text-xs font-medium text-muted-foreground mb-1 block'>
                                {t('ruleChat.titleLabel')}
                                <span className='ml-1 font-normal opacity-60'>(tùy chọn)</span>
                            </label>
                            <input type='text' value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                placeholder={t('ruleChat.titlePlaceholder')}
                                className='w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm
                                           text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50' />
                        </div>

                        {/* Message */}
                        <div>
                            <label className='text-xs font-medium text-muted-foreground mb-1 block'>
                                {t('ruleChat.messageLabel')}
                                <span className='ml-1 font-normal opacity-60'>(tùy chọn)</span>
                            </label>
                            <input type='text' value={form.message}
                                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                placeholder={t('ruleChat.messagePlaceholder')}
                                className='w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm
                                           text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50' />
                        </div>

                        <Button onClick={handleSaveRule} disabled={isCreating} size='sm' className='w-full gap-2'>
                            <CheckCircle2 size={14} />
                            {isCreating ? t('ruleChat.saving') : t('ruleChat.saveRule')}
                        </Button>
                    </div>
                )}

                {/* Rules list */}
                {isLoadingRules ? (
                    <div className='space-y-2'>
                        {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className='h-20 rounded-xl' />)}
                    </div>
                ) : rules.length === 0 ? (
                    <div className='flex flex-col items-center gap-2 py-8 text-center'>
                        <Shield size={32} className='text-muted-foreground/30' />
                        <p className='text-sm text-muted-foreground'>{t('rules.noRules')}</p>
                    </div>
                ) : (
                    <div className='space-y-3'>
                        {rules.map(rule => (
                            <div key={rule.uuid} className='rounded-xl border border-border bg-card p-4'>
                                <div className='flex items-start justify-between gap-3'>
                                    <div className='flex-1 min-w-0 space-y-1'>
                                        <div className='flex items-center gap-2 flex-wrap'>
                                            <Badge variant='secondary' className='text-xs'>{rule.type_label}</Badge>
                                            <Badge variant='outline' className='text-xs'>{rule.action_label}</Badge>
                                            {!rule.is_enabled && (
                                                <Badge variant='outline' className='text-xs text-muted-foreground'>
                                                    {t('rules.disabled')}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className='text-sm font-medium text-foreground'>{rule.title}</p>
                                        <p className='text-xs text-muted-foreground line-clamp-2'>{rule.message}</p>
                                        <RuleProgress rule={rule} />
                                    </div>
                                    <div className='flex items-center gap-1 shrink-0'>
                                        <button type='button' onClick={() => updateRule({ uuid: rule.uuid, is_enabled: !rule.is_enabled })}
                                            title={rule.is_enabled ? t('rules.toggleOff') : t('rules.toggleOn')}>
                                            {rule.is_enabled
                                                ? <ToggleRight size={22} className='text-primary' />
                                                : <ToggleLeft size={22} className='text-muted-foreground' />}
                                        </button>
                                        <button type='button'
                                            onClick={() => deleteRule(rule.uuid).then(() => toast.success(t('rules.toast.deleted')))}
                                            className='text-muted-foreground hover:text-destructive transition-colors p-1'>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <Separator />

            {/* ── Section 4: AI Analysis ── */}
            <section className='space-y-4'>
                <SectionHeader icon={Brain} title={t('tabs.analysis')} />

                <Button onClick={() => analyzeUsage()} disabled={isAnalyzing} className='w-full gap-2'>
                    {isAnalyzing
                        ? <><RefreshCw size={14} className='animate-spin' /> {t('analysis.analyzing')}</>
                        : <><Brain size={14} /> {t('analysis.analyzeBtn')}</>}
                </Button>

                {analysis && (
                    <div className='space-y-4'>
                        <div className='rounded-xl border border-border bg-card p-4'>
                            <p className='text-sm leading-relaxed text-foreground'>{analysis.summary}</p>
                        </div>

                        {analysis.patterns.length > 0 && (
                            <div className='space-y-1.5'>
                                <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>{t('analysis.trends')}</p>
                                {analysis.patterns.map((p, i) => (
                                    <p key={i} className='text-sm text-foreground'>→ {p}</p>
                                ))}
                            </div>
                        )}

                        {analysis.concerns.length > 0 && (
                            <div className='rounded-xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30 p-3 space-y-1'>
                                <p className='text-xs font-semibold text-yellow-700 dark:text-yellow-400'>{t('analysis.concerns')}</p>
                                {analysis.concerns.map((c, i) => (
                                    <p key={i} className='text-xs text-yellow-800 dark:text-yellow-300'>• {c}</p>
                                ))}
                            </div>
                        )}

                        {analysis.recommendations.length > 0 && (
                            <div className='space-y-1.5'>
                                <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>{t('analysis.recommendations')}</p>
                                {analysis.recommendations.map((r, i) => (
                                    <p key={i} className='text-sm text-muted-foreground'>✓ {r}</p>
                                ))}
                            </div>
                        )}

                        {analysis.suggested_rules.length > 0 && (
                            <div className='space-y-3'>
                                <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>{t('analysis.suggestedRules')}</p>
                                {analysis.suggested_rules.map((rule, i) => (
                                    <div key={i} className='rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2'>
                                        <div className='flex items-center gap-2'>
                                            <Badge variant='secondary' className='text-xs'>{WELLNESS_RULE_TYPE_LABELS[rule.type]}</Badge>
                                        </div>
                                        <p className='text-sm font-medium text-foreground'>{rule.title}</p>
                                        <p className='text-xs text-muted-foreground'>{rule.rationale}</p>
                                        <Button size='sm' variant='outline' className='w-full gap-1.5 h-7 text-xs'
                                            onClick={() => createRule({ type: rule.type, conditions: rule.conditions, action: rule.action, title: rule.title, message: rule.message }).then(() => toast.success(t('analysis.toast.ruleAdded')))}>
                                            <Plus size={11} />{t('analysis.addRule')}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Bottom padding for floating copilot panel */}
            <div className='h-4' />
        </div>
    )
}
