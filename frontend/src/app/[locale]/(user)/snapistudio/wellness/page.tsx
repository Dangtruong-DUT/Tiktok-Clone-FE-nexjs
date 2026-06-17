'use client'

import { useState } from 'react'
import {
    HeartPulse,
    Clock,
    BarChart2,
    Shield,
    Plus,
    Trash2,
    CheckCircle2,
    X,
    Timer,
    MessageCircle,
    Heart,
    FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useGetStatsQuery } from '@/store/services/wellness/screen-time.service'
import {
    useListRulesQuery,
    useCreateRuleMutation,
    useUpdateRuleMutation,
    useDeleteRuleMutation
} from '@/store/services/wellness/wellness-rule.service'
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

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
    return (
        <div className='rounded-xl border bg-card p-5 shadow-xs'>
            <div className='flex items-center justify-between'>
                <span className='text-xs font-medium text-muted-foreground'>{label}</span>
                <Icon className='h-4 w-4 text-muted-foreground' />
            </div>
            <div className='mt-2.5'>
                <span className='text-2xl font-semibold tracking-tight tabular-nums text-foreground'>{value}</span>
            </div>
        </div>
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
        <div className='mt-3 space-y-1.5'>
            <div className='flex items-center justify-between text-xs'>
                <span className='flex items-center gap-1.5 text-muted-foreground'>
                    <Timer size={12} />
                    {label}
                </span>
                <span className='font-medium text-foreground tabular-nums'>{Math.round(pct)}%</span>
            </div>
            <div className='h-1.5 w-full rounded-full bg-muted overflow-hidden'>
                <div
                    className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-destructive' : 'bg-primary'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
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

    const radarData = (() => {
        if (!stats || stats.total_seconds <= 0) return []
        const toPercent = (s: number) => Math.round((s / stats.total_seconds) * 100)
        const maxCount = Math.max(stats.comments_count, stats.likes_count, stats.posts_count, 1)
        return [
            { activity: t('stats.radarChart.video'), score: toPercent(stats.video_seconds) },
            { activity: t('stats.radarChart.comments'), score: Math.round((stats.comments_count / maxCount) * 100) },
            { activity: t('stats.radarChart.posts'), score: Math.round((stats.posts_count / maxCount) * 100) },
            { activity: t('stats.radarChart.likes'), score: Math.round((stats.likes_count / maxCount) * 100) },
            {
                activity: t('stats.radarChart.other'),
                score: toPercent(Math.max(0, stats.total_seconds - stats.video_seconds))
            }
        ]
    })()

    return (
        <div className='flex min-h-full flex-col'>
            <div className='flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-forwards'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight text-foreground'>{t('title')}</h1>
                        <p className='mt-1 text-sm text-muted-foreground'>{t('subtitle')}</p>
                    </div>

                    <div className='flex flex-wrap items-center gap-3'>
                        {/* Time periods selector */}
                        <div className='inline-flex rounded-lg border bg-muted/50 p-1 shadow-xs'>
                            {PERIODS.map((p) => (
                                <button
                                    key={p.value}
                                    onClick={() => setPeriod(p.value)}
                                    className={cn(
                                        'rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200',
                                        period === p.value
                                            ? 'bg-brand text-white shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <Button
                            onClick={() => setAddOpen((v) => !v)}
                            className='h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90'
                        >
                            {addOpen ? <X size={14} className='mr-1.5' /> : <Plus size={14} className='mr-1.5' />}
                            {addOpen ? t('ruleChat.dismiss') : t('rules.createTitle')}
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                {isLoadingStats ? (
                    <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className='h-24 rounded-xl' />
                        ))}
                    </div>
                ) : stats ? (
                    <>
                        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                            <StatCard
                                label={t('stats.totalTime')}
                                value={formatDuration(stats.total_seconds)}
                                icon={Clock}
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
                            <StatCard
                                label={t('tabs.rules')}
                                value={`${activeRulesCount}/${rules.length}`}
                                icon={Shield}
                            />
                        </div>
                        <div className='grid grid-cols-3 gap-4'>
                            <StatCard label={t('stats.comments')} value={stats.comments_count} icon={MessageCircle} />
                            <StatCard label={t('stats.likes')} value={stats.likes_count} icon={Heart} />
                            <StatCard label={t('stats.posts')} value={stats.posts_count} icon={FileText} />
                        </div>
                    </>
                ) : null}

                {/* Charts */}
                {!isLoadingStats && stats && (
                    <div className='space-y-6'>
                        <div className='grid gap-6 md:grid-cols-2'>
                            {stats.daily_series.length > 0 && (
                                <div className='rounded-xl border bg-card p-5 shadow-xs'>
                                    <div className='mb-4 flex items-center justify-between'>
                                        <p className='text-sm font-semibold text-foreground'>{t('stats.chartTitle')}</p>
                                        <span className='text-xs text-muted-foreground'>{t('stats.timeLabel')}</span>
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
                                </div>
                            )}

                            {radarData.length > 0 && (
                                <div className='rounded-xl border bg-card p-5 shadow-xs'>
                                    <p className='text-sm font-semibold text-foreground'>
                                        {t('stats.radarChart.title')}
                                    </p>
                                    <p className='mt-1 text-xs text-muted-foreground'>
                                        {t('stats.radarChart.description')}
                                    </p>
                                    <ChartContainer config={radarConfig} className='h-[220px] w-full aspect-auto mt-4'>
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
                                </div>
                            )}
                        </div>

                        {stats.total_seconds > 0 && (
                            <div className='rounded-xl border bg-card p-5 shadow-xs'>
                                <p className='text-sm font-semibold text-foreground'>{t('stats.distributionTitle')}</p>
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
                            </div>
                        )}
                    </div>
                )}

                {/* Rules Section */}
                <div className='space-y-6 pt-4'>
                    <div className='flex items-center justify-between border-b pb-3'>
                        <h2 className='text-lg font-semibold tracking-tight text-foreground'>{t('tabs.rules')}</h2>
                    </div>

                    {addOpen && (
                        <div className='space-y-4 rounded-xl border bg-card p-5 shadow-xs'>
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
                                                'rounded-md border px-3 py-2 text-left text-xs font-medium transition-all duration-200',
                                                form.type === rt.value
                                                    ? 'border-brand bg-brand text-white'
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
                                            <p className='text-[10px] text-muted-foreground'>{t('ruleChat.toHour')}</p>
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
                        </div>
                    )}

                    {isLoadingRules ? (
                        <div className='space-y-3'>
                            {Array.from({ length: 2 }).map((_, i) => (
                                <Skeleton key={i} className='h-20 rounded-xl' />
                            ))}
                        </div>
                    ) : rules.length === 0 ? (
                        <div className='flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/70 bg-card py-10 text-center'>
                            <Shield size={32} className='text-muted-foreground/30' />
                            <p className='text-sm text-muted-foreground'>{t('rules.noRules')}</p>
                        </div>
                    ) : (
                        <div className='grid gap-4 sm:grid-cols-2'>
                            {rules.map((rule) => (
                                <div
                                    key={rule.uuid}
                                    className='rounded-xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm'
                                >
                                    <div className='flex items-start justify-between gap-4'>
                                        <div className='flex-1 min-w-0 space-y-3'>
                                            <div className='flex flex-wrap items-center gap-2'>
                                                <Badge className='border border-primary/15 bg-primary/5 text-xs text-primary hover:bg-primary/5'>
                                                    {rule.type_label}
                                                </Badge>
                                                <Badge
                                                    variant='outline'
                                                    className='border-border/50 bg-background text-xs'
                                                >
                                                    {rule.action_label}
                                                </Badge>
                                                {!rule.is_enabled && (
                                                    <Badge
                                                        variant='outline'
                                                        className='border-border/50 text-xs text-muted-foreground'
                                                    >
                                                        {t('rules.disabled')}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className='space-y-1'>
                                                <p className='text-sm font-semibold text-foreground'>{rule.title}</p>
                                                <p className='text-xs leading-relaxed text-muted-foreground'>
                                                    {rule.message}
                                                </p>
                                            </div>
                                            <RuleProgress rule={rule} />
                                        </div>
                                        <div className='flex shrink-0 items-center gap-3'>
                                            <Switch
                                                checked={rule.is_enabled}
                                                onCheckedChange={(checked) =>
                                                    updateRule({ uuid: rule.uuid, is_enabled: checked })
                                                }
                                                aria-label={
                                                    rule.is_enabled ? t('rules.toggleOff') : t('rules.toggleOn')
                                                }
                                            />
                                            <button
                                                type='button'
                                                onClick={() =>
                                                    deleteRule(rule.uuid).then(() =>
                                                        toast.success(t('rules.toast.deleted'))
                                                    )
                                                }
                                                className='rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive'
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
