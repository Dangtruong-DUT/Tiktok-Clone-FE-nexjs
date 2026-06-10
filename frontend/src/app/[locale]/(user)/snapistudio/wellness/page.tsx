'use client'

import { useState } from 'react'
import { HeartPulse, Clock, BarChart2, Shield, Plus, Trash2, CheckCircle2, X, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useGetStatsQuery } from '@/store/services/screen-time.service'
import {
    useListRulesQuery,
    useCreateRuleMutation,
    useUpdateRuleMutation,
    useDeleteRuleMutation
} from '@/store/services/wellness-rule.service'
import { WELLNESS_PERIODS } from '@/constants/wellness'
import type { WellnessPeriod, WellnessRuleItem } from '@/types/models/screen-time.model'

type RuleTypeValue = 'continuous_usage' | 'daily_limit' | 'video_watch_time' | 'late_night'
type ActionTypeValue = 'warning' | 'soft_block'

interface ManualForm {
    type: RuleTypeValue
    minutes: number
    fromHour: number
    toHour: number
    action: ActionTypeValue
    title: string
    message: string
}

const defaultForm: ManualForm = {
    type: 'continuous_usage',
    minutes: 60,
    fromHour: 22,
    toHour: 6,
    action: 'warning',
    title: '',
    message: ''
}

function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function StatCard({
    label,
    value,
    icon: Icon,
    color = ''
}: {
    label: string
    value: string | number
    icon: React.ElementType
    color?: string
}) {
    return (
        <Card className='group relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-primary/5 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5'>
            <div className='absolute inset-x-0 top-0 h-1 bg-primary/70' />
            <div className='flex items-center justify-between gap-3'>
                <p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground'>{label}</p>
                <span className='flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary'>
                    <Icon size={14} />
                </span>
            </div>
            <p className={cn('mt-6 text-3xl font-semibold tracking-tight tabular-nums', color || 'text-foreground')}>
                {value}
            </p>
        </Card>
    )
}

function RuleProgress({ rule }: { rule: WellnessRuleItem }) {
    const t = useTranslations('SnapiStudio.wellness')
    const threshold = Number(rule.conditions['minutes'] ?? 60)
    if (!rule.is_enabled || rule.type !== 'continuous_usage') return null

    const elapsedMinutes = (Date.now() - new Date(rule.created_at).getTime()) / 60_000
    const currentCycle = Math.floor(elapsedMinutes / threshold)
    const elapsedInCycle = elapsedMinutes % threshold
    const pct = Math.min(100, (elapsedInCycle / threshold) * 100)
    const remainingMin = Math.max(0, Math.ceil(threshold - elapsedInCycle))

    const label =
        remainingMin === 0
            ? t('rules.progress.activating')
            : t('rules.progress.remaining', { minutes: remainingMin, cycle: currentCycle + 1 })

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

function SectionHeader({
    icon: Icon,
    title,
    action
}: {
    icon: React.ElementType
    title: string
    action?: React.ReactNode
}) {
    return (
        <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
                <div className='flex size-8 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/10'>
                    <Icon size={14} className='text-primary' />
                </div>
                <h2 className='text-sm font-semibold tracking-tight text-foreground'>{title}</h2>
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

    const { data: statsData, isLoading: isLoadingStats } = useGetStatsQuery({ period })
    const stats = statsData?.data

    const { data: rulesData, isLoading: isLoadingRules } = useListRulesQuery()
    const [createRule, { isLoading: isCreating }] = useCreateRuleMutation()
    const [updateRule] = useUpdateRuleMutation()
    const [deleteRule] = useDeleteRuleMutation()
    const rules = rulesData?.data ?? []
    const activeRulesCount = rules.filter((rule) => rule.is_enabled).length
    const inactiveRulesCount = Math.max(0, rules.length - activeRulesCount)

    const RULE_TYPES: { value: RuleTypeValue; label: string }[] = [
        { value: 'continuous_usage', label: t('ruleChat.types.continuous_usage') },
        { value: 'daily_limit', label: t('ruleChat.types.daily_limit') },
        { value: 'video_watch_time', label: t('ruleChat.types.video_watch_time') },
        { value: 'late_night', label: t('ruleChat.types.late_night') }
    ]
    const ACTIONS: { value: ActionTypeValue; label: string }[] = [
        { value: 'warning', label: t('ruleChat.actions.warning') },
        { value: 'soft_block', label: t('ruleChat.actions.soft_block') }
    ]

    const PERIODS = [
        { value: WELLNESS_PERIODS.TODAY, label: t('stats.periods.today') },
        { value: WELLNESS_PERIODS.WEEK, label: t('stats.periods.week') },
        { value: WELLNESS_PERIODS.MONTH, label: t('stats.periods.month') }
    ] as const

    const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? `${m % 60}m` : ''}` : `${m}m`)

    const handleSaveRule = async () => {
        const isLateNight = form.type === 'late_night'
        const resolvedTitle =
            form.title.trim() ||
            t(`ruleChat.defaults.${form.type}.title`, {
                duration: fmtMin(form.minutes),
                fromHour: form.fromHour,
                toHour: form.toHour
            })
        const resolvedMessage =
            form.message.trim() ||
            t(`ruleChat.defaults.${form.type}.message`, {
                duration: fmtMin(form.minutes),
                fromHour: form.fromHour,
                toHour: form.toHour
            })

        try {
            await createRule({
                type: form.type,
                conditions: isLateNight
                    ? { from_hour: form.fromHour, to_hour: form.toHour }
                    : { minutes: form.minutes },
                action: form.action,
                title: resolvedTitle,
                message: resolvedMessage
            }).unwrap()
            toast.success(t('rules.toast.saved'))
            setForm(defaultForm)
            setAddOpen(false)
        } catch {
            toast.error(t('ruleChat.errorSave'))
        }
    }

    const chartConfig = {
        seconds: {
            label: t('stats.timeLabel'),
            color: 'var(--chart-1)'
        }
    } satisfies ChartConfig

    const radarConfig = {
        score: { label: t('stats.radarChart.score'), color: 'var(--chart-2)' }
    } satisfies ChartConfig

    const radarData =
        stats && stats.total_seconds > 0
            ? [
                  {
                      activity: t('stats.radarChart.video'),
                      score: Math.round((stats.video_seconds / stats.total_seconds) * 100)
                  },
                  { activity: t('stats.radarChart.comments'), score: Math.min(100, stats.comments_count * 10) },
                  { activity: t('stats.radarChart.posts'), score: Math.min(100, stats.posts_count * 20) },
                  { activity: t('stats.radarChart.likes'), score: Math.min(100, stats.likes_count * 5) },
                  {
                      activity: t('stats.radarChart.other'),
                      score: Math.round(
                          (Math.max(0, stats.total_seconds - stats.video_seconds) / stats.total_seconds) * 100
                      )
                  }
              ]
            : []

    return (
        <div className='relative overflow-hidden bg-gradient-to-b from-background via-background to-primary/5'>
            <div className='pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl' />
            <div className='pointer-events-none absolute left-0 top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl' />

            <div className='relative mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-10'>
                <div className='grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_360px]'>
                    <div className='space-y-8'>
                        <Card className='relative overflow-hidden rounded-[28px] border border-primary/15 bg-card/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur'>
                            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.07),transparent_45%)]' />
                            <div className='relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
                                <div className='max-w-2xl space-y-4'>
                                    <span className='inline-flex items-center rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary'>
                                        Daily overview
                                    </span>
                                    <div className='space-y-2'>
                                        <h1 className='text-3xl font-semibold tracking-tight text-foreground md:text-4xl'>
                                            {t('title')}
                                        </h1>
                                        <p className='max-w-xl text-sm leading-6 text-muted-foreground md:text-base'>
                                            {t('subtitle')}
                                        </p>
                                    </div>
                                    <div className='flex flex-wrap items-center gap-3'>
                                        <Button
                                            onClick={() => setAddOpen(true)}
                                            className='h-10 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90'
                                        >
                                            <Plus size={14} />
                                            {t('rules.createTitle')}
                                        </Button>
                                    </div>
                                </div>

                                <div className='grid gap-3 sm:grid-cols-3 md:min-w-[360px] md:grid-cols-3'>
                                    <div className='rounded-2xl border border-border/70 bg-background/80 p-4 backdrop-blur'>
                                        <p className='text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
                                            {t('stats.totalTime')}
                                        </p>
                                        <p className='mt-3 text-2xl font-semibold tracking-tight text-primary tabular-nums'>
                                            {formatDuration(stats?.total_seconds ?? 0)}
                                        </p>
                                    </div>
                                    <div className='rounded-2xl border border-border/70 bg-background/80 p-4 backdrop-blur'>
                                        <p className='text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
                                            {t('stats.sessions')}
                                        </p>
                                        <p className='mt-3 text-2xl font-semibold tracking-tight text-foreground tabular-nums'>
                                            {stats?.sessions_count ?? 0}
                                        </p>
                                    </div>
                                    <div className='rounded-2xl border border-border/70 bg-background/80 p-4 backdrop-blur'>
                                        <p className='text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
                                            {t('tabs.rules')}
                                        </p>
                                        <p className='mt-3 text-2xl font-semibold tracking-tight text-foreground tabular-nums'>
                                            {rules.length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <section className='space-y-4'>
                            <SectionHeader
                                icon={BarChart2}
                                title={t('tabs.stats')}
                                action={
                                    <div className='inline-flex rounded-full border border-border/70 bg-background/80 p-1 shadow-sm backdrop-blur'>
                                        {PERIODS.map((p) => (
                                            <button
                                                key={p.value}
                                                onClick={() => setPeriod(p.value)}
                                                className={cn(
                                                    'rounded-full px-4 py-2 text-xs font-medium transition-all duration-200',
                                                    period === p.value
                                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                )}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                }
                            />

                            {isLoadingStats ? (
                                <div className='grid grid-cols-2 gap-3'>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <Skeleton key={i} className='h-24 rounded-2xl' />
                                    ))}
                                </div>
                            ) : stats ? (
                                <>
                                    <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                                        <StatCard
                                            label={t('stats.totalTime')}
                                            value={formatDuration(stats.total_seconds)}
                                            icon={Clock}
                                            color='text-primary'
                                        />
                                        <StatCard
                                            label={t('stats.watchingVideo')}
                                            value={formatDuration(stats.video_seconds)}
                                            icon={HeartPulse}
                                        />
                                        <StatCard
                                            label={t('stats.dailyAvg')}
                                            value={formatDuration(stats.avg_daily_seconds)}
                                            icon={BarChart2}
                                        />
                                        <StatCard label={t('stats.sessions')} value={stats.sessions_count} icon={Clock} />
                                        <StatCard label={t('stats.comments')} value={stats.comments_count} icon={BarChart2} />
                                        <StatCard label={t('stats.posts')} value={stats.posts_count} icon={BarChart2} />
                                    </div>

                                    <div className='grid gap-4 lg:grid-cols-2'>
                                        {stats.daily_series.length > 0 && (
                                            <Card className='overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-primary/5 p-4 shadow-sm'>
                                                <div className='mb-3 flex items-center justify-between gap-3'>
                                                    <p className='text-sm font-semibold tracking-tight text-foreground'>
                                                        {t('stats.chartTitle')}
                                                    </p>
                                                    <span className='rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary'>
                                                        {t('stats.timeLabel')}
                                                    </span>
                                                </div>
                                                <ChartContainer config={chartConfig} className='h-[220px] w-full aspect-auto'>
                                                    <BarChart
                                                        data={stats.daily_series}
                                                        margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
                                                    >
                                                        <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
                                                        <XAxis
                                                            dataKey='date'
                                                            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                                                            tickFormatter={(d) => d.slice(5)}
                                                        />
                                                        <YAxis
                                                            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                                                            tickFormatter={(s) => `${Math.round(s / 60)}m`}
                                                        />
                                                        <ChartTooltip
                                                            content={
                                                                <ChartTooltipContent
                                                                    formatter={(value) => [
                                                                        formatDuration(value as number),
                                                                        t('stats.timeLabel')
                                                                    ]}
                                                                />
                                                            }
                                                        />
                                                        <Bar dataKey='seconds' fill='var(--color-seconds)' radius={[8, 8, 0, 0]} />
                                                    </BarChart>
                                                </ChartContainer>
                                            </Card>
                                        )}

                                        {radarData.length > 0 && (
                                            <Card className='overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm'>
                                                <p className='text-sm font-semibold tracking-tight text-foreground'>
                                                    {t('stats.radarChart.title')}
                                                </p>
                                                <p className='mt-1 text-xs leading-5 text-muted-foreground'>
                                                    {t('stats.radarChart.description')}
                                                </p>
                                                <ChartContainer config={radarConfig} className='h-[220px] w-full aspect-auto'>
                                                    <RadarChart
                                                        data={radarData}
                                                        margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
                                                    >
                                                        <PolarGrid stroke='var(--border)' />
                                                        <PolarAngleAxis
                                                            dataKey='activity'
                                                            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                                                        />
                                                        <ChartTooltip
                                                            content={
                                                                <ChartTooltipContent
                                                                    formatter={(v) => [`${v}`, t('stats.radarChart.score')]}
                                                                />
                                                            }
                                                        />
                                                        <Radar
                                                            dataKey='score'
                                                            stroke='var(--color-score)'
                                                            fill='var(--color-score)'
                                                            fillOpacity={0.3}
                                                        />
                                                    </RadarChart>
                                                </ChartContainer>
                                            </Card>
                                        )}
                                    </div>

                                    {stats.total_seconds > 0 && (
                                        <Card className='overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm'>
                                            <p className='text-sm font-semibold tracking-tight text-foreground'>
                                                {t('stats.distributionTitle')}
                                            </p>
                                            <div className='mt-4 space-y-4'>
                                                {[
                                                    {
                                                        label: t('stats.watchingVideo'),
                                                        seconds: stats.video_seconds,
                                                        color: 'bg-primary'
                                                    },
                                                    {
                                                        label: t('stats.otherOnline'),
                                                        seconds: Math.max(0, stats.total_seconds - stats.video_seconds),
                                                        color: 'bg-muted-foreground/40'
                                                    }
                                                ].map(({ label, seconds, color }) => {
                                                    const pct = Math.round((seconds / stats.total_seconds) * 100)
                                                    return (
                                                        <div key={label} className='space-y-1.5'>
                                                            <div className='flex justify-between text-xs'>
                                                                <span className='text-muted-foreground'>{label}</span>
                                                                <span className='font-medium tabular-nums text-foreground'>
                                                                    {formatDuration(seconds)} ({pct}%)
                                                                </span>
                                                            </div>
                                                            <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
                                                                <div
                                                                    className={`h-full rounded-full transition-all ${color}`}
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </Card>
                                    )}
                                </>
                            ) : null}
                        </section>

                        <Separator />

                        <section id='wellness-rules' className='space-y-4'>
                            <SectionHeader
                                icon={Shield}
                                title={t('tabs.rules')}
                                action={
                                    <Button
                                        size='sm'
                                        variant={addOpen ? 'outline' : 'default'}
                                        className='h-9 gap-1.5 rounded-full px-4 text-xs shadow-md shadow-primary/20'
                                        onClick={() => setAddOpen((v) => !v)}
                                    >
                                        {addOpen ? <X size={12} /> : <Plus size={12} />}
                                        {addOpen ? t('ruleChat.dismiss') : t('rules.createTitle').split(' ').slice(0, 2).join(' ')}
                                    </Button>
                                }
                            />

                            {addOpen && (
                                <Card className='space-y-4 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-4 shadow-sm'>
                                    <div className='space-y-1.5'>
                                        <label className='block text-xs font-medium text-muted-foreground'>
                                            {t('ruleChat.ruleType')}
                                        </label>
                                        <div className='grid grid-cols-2 gap-1.5'>
                                            {RULE_TYPES.map((rt) => (
                                                <button
                                                    key={rt.value}
                                                    onClick={() => setForm((f) => ({ ...f, type: rt.value }))}
                                                    className={cn(
                                                        'rounded-lg border px-2 py-1.5 text-left text-[11px] font-medium transition-colors',
                                                        form.type === rt.value
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-border bg-background text-muted-foreground hover:bg-muted'
                                                    )}
                                                >
                                                    {rt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {form.type === 'late_night' ? (
                                        <div className='space-y-1.5'>
                                            <label className='block text-xs font-medium text-muted-foreground'>
                                                {t('ruleChat.timeRange')}
                                            </label>
                                            <div className='grid grid-cols-2 gap-3'>
                                                <div className='space-y-1'>
                                                    <p className='text-[10px] text-muted-foreground'>
                                                        {t('ruleChat.fromHour')}
                                                    </p>
                                                    <Select
                                                        value={String(form.fromHour)}
                                                        onValueChange={(v) => setForm((f) => ({ ...f, fromHour: +v }))}
                                                    >
                                                        <SelectTrigger className='h-9 text-sm'>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Array.from({ length: 24 }, (_, i) => (
                                                                <SelectItem key={i} value={String(i)}>
                                                                    {String(i).padStart(2, '0')}:00
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className='space-y-1'>
                                                    <p className='text-[10px] text-muted-foreground'>
                                                        {t('ruleChat.toHour')}
                                                    </p>
                                                    <Select
                                                        value={String(form.toHour)}
                                                        onValueChange={(v) => setForm((f) => ({ ...f, toHour: +v }))}
                                                    >
                                                        <SelectTrigger className='h-9 text-sm'>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Array.from({ length: 24 }, (_, i) => (
                                                                <SelectItem key={i} value={String(i)}>
                                                                    {String(i).padStart(2, '0')}:00
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='space-y-1.5'>
                                            <label className='block text-xs font-medium text-muted-foreground'>
                                                {t('ruleChat.duration')}
                                            </label>
                                            <div className='flex items-center gap-3'>
                                                <input
                                                    type='range'
                                                    min={10}
                                                    max={240}
                                                    step={5}
                                                    value={form.minutes}
                                                    onChange={(e) => setForm((f) => ({ ...f, minutes: +e.target.value }))}
                                                    className='flex-1 accent-primary'
                                                />
                                                <span className='w-12 text-right text-sm font-semibold tabular-nums text-foreground'>
                                                    {fmtMin(form.minutes)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className='space-y-1.5'>
                                        <label className='block text-xs font-medium text-muted-foreground'>
                                            {t('ruleChat.action')}
                                        </label>
                                        <Select
                                            value={form.action}
                                            onValueChange={(val) => setForm((f) => ({ ...f, action: val as ActionTypeValue }))}
                                        >
                                            <SelectTrigger className='h-9 text-sm'>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ACTIONS.map((a) => (
                                                    <SelectItem key={a.value} value={a.value}>
                                                        {a.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className='space-y-1.5'>
                                        <label className='block text-xs font-medium text-muted-foreground'>
                                            {t('ruleChat.titleLabel')}
                                            <span className='ml-1 font-normal opacity-60'>({t('ruleChat.optional')})</span>
                                        </label>
                                        <Input
                                            value={form.title}
                                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                            placeholder={t('ruleChat.titlePlaceholder')}
                                        />
                                    </div>

                                    <div className='space-y-1.5'>
                                        <label className='block text-xs font-medium text-muted-foreground'>
                                            {t('ruleChat.messageLabel')}
                                            <span className='ml-1 font-normal opacity-60'>({t('ruleChat.optional')})</span>
                                        </label>
                                        <Textarea
                                            value={form.message}
                                            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                                            placeholder={t('ruleChat.messagePlaceholder')}
                                            rows={2}
                                            className='resize-none'
                                        />
                                    </div>

                                    <Button onClick={handleSaveRule} disabled={isCreating} size='sm' className='w-full gap-2'>
                                        <CheckCircle2 size={14} />
                                        {isCreating ? t('ruleChat.saving') : t('ruleChat.saveRule')}
                                    </Button>
                                </Card>
                            )}

                            {isLoadingRules ? (
                                <div className='space-y-2'>
                                    {Array.from({ length: 2 }).map((_, i) => (
                                        <Skeleton key={i} className='h-20 rounded-2xl' />
                                    ))}
                                </div>
                            ) : rules.length === 0 ? (
                                <div className='flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/70 bg-card/70 py-10 text-center'>
                                    <Shield size={32} className='text-primary/30' />
                                    <p className='text-sm text-muted-foreground'>{t('rules.noRules')}</p>
                                </div>
                            ) : (
                                <div className='space-y-3'>
                                    {rules.map((rule) => (
                                        <Card
                                            key={rule.uuid}
                                            className={cn(
                                                'relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
                                                rule.is_enabled ? 'border-primary/15' : 'border-border/70'
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'absolute inset-y-0 left-0 w-1',
                                                    rule.is_enabled ? 'bg-primary' : 'bg-muted-foreground/30'
                                                )}
                                            />
                                            <div className='flex items-start justify-between gap-4 pl-2'>
                                                <div className='flex-1 min-w-0 space-y-2'>
                                                    <div className='flex flex-wrap items-center gap-2'>
                                                        <Badge className='border border-primary/15 bg-primary/10 text-xs text-primary hover:bg-primary/10'>
                                                            {rule.type_label}
                                                        </Badge>
                                                        <Badge variant='outline' className='border-border/70 bg-background text-xs'>
                                                            {rule.action_label}
                                                        </Badge>
                                                        {!rule.is_enabled && (
                                                            <Badge variant='outline' className='border-border/70 text-xs text-muted-foreground'>
                                                                {t('rules.disabled')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <p className='text-sm font-semibold tracking-tight text-foreground'>
                                                            {rule.title}
                                                        </p>
                                                        <p className='text-xs leading-5 text-muted-foreground line-clamp-2'>
                                                            {rule.message}
                                                        </p>
                                                    </div>
                                                    <RuleProgress rule={rule} />
                                                </div>
                                                <div className='flex shrink-0 items-center gap-2'>
                                                    <Switch
                                                        checked={rule.is_enabled}
                                                        onCheckedChange={(checked) =>
                                                            updateRule({ uuid: rule.uuid, is_enabled: checked })
                                                        }
                                                        aria-label={rule.is_enabled ? t('rules.toggleOff') : t('rules.toggleOn')}
                                                    />
                                                    <button
                                                        type='button'
                                                        onClick={() =>
                                                            deleteRule(rule.uuid).then(() =>
                                                                toast.success(t('rules.toast.deleted'))
                                                            )
                                                        }
                                                        className='rounded-full p-1 text-muted-foreground transition-colors hover:text-destructive'
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className='space-y-4 xl:sticky xl:top-6 xl:h-fit'>
                        <Card className='relative overflow-hidden rounded-[28px] border border-primary/15 bg-card/90 p-5 shadow-sm'>
                            <div className='absolute inset-x-0 top-0 h-1 bg-primary' />
                            <div className='space-y-4'>
                                <div>
                                    <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-primary'>
                                        {t('tabs.stats')}
                                    </p>
                                    <h3 className='mt-2 text-lg font-semibold tracking-tight text-foreground'>
                                        {t('stats.chartTitle')}
                                    </h3>
                                    <p className='mt-1 text-sm leading-6 text-muted-foreground'>
                                        {t('stats.distributionTitle')}
                                    </p>
                                </div>

                                <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-1'>
                                    <div className='rounded-2xl border border-border/70 bg-background/80 p-4'>
                                        <p className='text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
                                            {t('stats.totalTime')}
                                        </p>
                                        <p className='mt-2 text-2xl font-semibold tracking-tight text-primary tabular-nums'>
                                            {formatDuration(stats?.total_seconds ?? 0)}
                                        </p>
                                    </div>
                                    <div className='rounded-2xl border border-border/70 bg-background/80 p-4'>
                                        <p className='text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
                                            {t('stats.dailyAvg')}
                                        </p>
                                        <p className='mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums'>
                                            {formatDuration(stats?.avg_daily_seconds ?? 0)}
                                        </p>
                                    </div>
                                    <div className='rounded-2xl border border-border/70 bg-background/80 p-4'>
                                        <p className='text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
                                            {t('tabs.rules')}
                                        </p>
                                        <p className='mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums'>
                                            {activeRulesCount}
                                        </p>
                                        <p className='mt-1 text-xs text-muted-foreground'>
                                            {inactiveRulesCount > 0
                                                ? `${inactiveRulesCount} ${t('rules.disabled')}`
                                                : t('rules.noRules')}
                                        </p>
                                    </div>
                                </div>

                                <div className='rounded-2xl border border-border/70 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-4'>
                                    <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'>
                                        {t('stats.watchingVideo')}
                                    </p>
                                    <p className='mt-2 text-sm leading-6 text-foreground'>
                                        {stats?.total_seconds ? t('stats.chartTitle') : t('rules.noRules')}
                                    </p>
                                    <div className='mt-4 h-2 overflow-hidden rounded-full bg-primary/10'>
                                        <div
                                            className='h-full rounded-full bg-primary transition-all'
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    Math.round(
                                                        ((stats?.video_seconds ?? 0) / Math.max(1, stats?.total_seconds ?? 1)) * 100
                                                    )
                                                )}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </aside>
                </div>

                <div className='h-4' />
            </div>
        </div>
    )
}
