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
        <Card className='p-4 space-y-2'>
            <div className='flex items-center justify-between'>
                <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>{label}</p>
                <Icon size={15} className='text-muted-foreground' />
            </div>
            <p className={cn('text-2xl font-bold', color || 'text-foreground')}>{value}</p>
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

    const { data: statsData, isLoading: isLoadingStats } = useGetStatsQuery({ period })
    const stats = statsData?.data

    const { data: rulesData, isLoading: isLoadingRules } = useListRulesQuery()
    const [createRule, { isLoading: isCreating }] = useCreateRuleMutation()
    const [updateRule] = useUpdateRuleMutation()
    const [deleteRule] = useDeleteRuleMutation()
    const rules = rulesData?.data ?? []

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

            <section className='space-y-3'>
                <SectionHeader
                    icon={BarChart2}
                    title={t('tabs.stats')}
                    action={
                        <div className='flex gap-1'>
                            {PERIODS.map((p) => (
                                <button
                                    key={p.value}
                                    onClick={() => setPeriod(p.value)}
                                    className={cn(
                                        'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                                        period === p.value
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground hover:text-foreground'
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
                            <Skeleton key={i} className='h-24 rounded-xl' />
                        ))}
                    </div>
                ) : stats ? (
                    <>
                        <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
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

                        {stats.daily_series.length > 0 && (
                            <Card className='p-4'>
                                <p className='text-sm font-semibold mb-3 text-foreground'>{t('stats.chartTitle')}</p>
                                <ChartContainer config={chartConfig} className='h-[180px] w-full aspect-auto'>
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
                                        <Bar dataKey='seconds' fill='var(--color-seconds)' radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ChartContainer>
                            </Card>
                        )}

                        {radarData.length > 0 && (
                            <Card className='p-4'>
                                <p className='text-sm font-semibold mb-1 text-foreground'>
                                    {t('stats.radarChart.title')}
                                </p>
                                <p className='text-xs text-muted-foreground mb-3'>
                                    {t('stats.radarChart.description')}
                                </p>
                                <ChartContainer config={radarConfig} className='h-[200px] w-full aspect-auto'>
                                    <RadarChart data={radarData} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
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

                        {stats.total_seconds > 0 && (
                            <Card className='p-4 space-y-3'>
                                <p className='text-sm font-semibold text-foreground'>{t('stats.distributionTitle')}</p>
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
                                        <div key={label} className='space-y-1'>
                                            <div className='flex justify-between text-xs'>
                                                <span className='text-muted-foreground'>{label}</span>
                                                <span className='font-medium tabular-nums text-foreground'>
                                                    {formatDuration(seconds)} ({pct}%)
                                                </span>
                                            </div>
                                            <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
                                                <div
                                                    className={`h-full rounded-full transition-all ${color}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </Card>
                        )}
                    </>
                ) : null}
            </section>

            <Separator />

            <section className='space-y-4'>
                <SectionHeader
                    icon={Shield}
                    title={t('tabs.rules')}
                    action={
                        <Button
                            size='sm'
                            variant={addOpen ? 'outline' : 'default'}
                            className='h-7 text-xs gap-1'
                            onClick={() => setAddOpen((v) => !v)}
                        >
                            {addOpen ? <X size={12} /> : <Plus size={12} />}
                            {addOpen ? t('ruleChat.dismiss') : t('rules.createTitle').split(' ').slice(0, 2).join(' ')}
                        </Button>
                    }
                />

                {/* Inline rule creation form */}
                {addOpen && (
                    <Card className='p-4 space-y-4'>
                        {/* Type */}
                        <div className='space-y-1.5'>
                            <label className='text-xs font-medium text-muted-foreground block'>
                                {t('ruleChat.ruleType')}
                            </label>
                            <div className='grid grid-cols-2 gap-1.5'>
                                {RULE_TYPES.map((rt) => (
                                    <button
                                        key={rt.value}
                                        onClick={() => setForm((f) => ({ ...f, type: rt.value }))}
                                        className={cn(
                                            'rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors text-left',
                                            form.type === rt.value
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border text-muted-foreground hover:bg-muted'
                                        )}
                                    >
                                        {rt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Duration or Time Range */}
                        {form.type === 'late_night' ? (
                            <div className='space-y-1.5'>
                                <label className='text-xs font-medium text-muted-foreground block'>
                                    {t('ruleChat.timeRange')}
                                </label>
                                <div className='grid grid-cols-2 gap-3'>
                                    <div className='space-y-1'>
                                        <p className='text-[10px] text-muted-foreground'>{t('ruleChat.fromHour')}</p>
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
                                <label className='text-xs font-medium text-muted-foreground block'>
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
                                    <span className='text-sm font-semibold w-12 text-right tabular-nums text-foreground'>
                                        {fmtMin(form.minutes)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Action */}
                        <div className='space-y-1.5'>
                            <label className='text-xs font-medium text-muted-foreground block'>
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

                        {/* Title */}
                        <div className='space-y-1.5'>
                            <label className='text-xs font-medium text-muted-foreground block'>
                                {t('ruleChat.titleLabel')}
                                <span className='ml-1 font-normal opacity-60'>({t('ruleChat.optional')})</span>
                            </label>
                            <Input
                                value={form.title}
                                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                placeholder={t('ruleChat.titlePlaceholder')}
                            />
                        </div>

                        {/* Message */}
                        <div className='space-y-1.5'>
                            <label className='text-xs font-medium text-muted-foreground block'>
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

                {/* Rules list */}
                {isLoadingRules ? (
                    <div className='space-y-2'>
                        {Array.from({ length: 2 }).map((_, i) => (
                            <Skeleton key={i} className='h-20 rounded-xl' />
                        ))}
                    </div>
                ) : rules.length === 0 ? (
                    <div className='flex flex-col items-center gap-2 py-8 text-center'>
                        <Shield size={32} className='text-muted-foreground/30' />
                        <p className='text-sm text-muted-foreground'>{t('rules.noRules')}</p>
                    </div>
                ) : (
                    <div className='space-y-3'>
                        {rules.map((rule) => (
                            <Card key={rule.uuid} className='p-4'>
                                <div className='flex items-start justify-between gap-3'>
                                    <div className='flex-1 min-w-0 space-y-1'>
                                        <div className='flex items-center gap-2 flex-wrap'>
                                            <Badge variant='secondary' className='text-xs'>
                                                {rule.type_label}
                                            </Badge>
                                            <Badge variant='outline' className='text-xs'>
                                                {rule.action_label}
                                            </Badge>
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
                                            className='text-muted-foreground hover:text-destructive transition-colors p-1'
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

            <div className='h-4' />
        </div>
    )
}
