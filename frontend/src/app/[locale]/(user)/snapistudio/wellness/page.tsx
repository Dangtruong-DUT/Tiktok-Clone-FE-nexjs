'use client'

import { useState, useCallback } from 'react'
import {
    HeartPulse,
    Clock,
    BarChart2,
    Shield,
    Brain,
    Plus,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Sparkles,
    RefreshCw,
    CheckCircle2
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
    useParseNLRuleMutation,
    useAnalyzeUsageMutation
} from '@/store/services/wellness-rule.service'
import { WELLNESS_RULE_TYPE_LABELS, WELLNESS_ACTION_LABELS, WELLNESS_PERIODS } from '@/constants/wellness'
import type { WellnessPeriod, ParsedRulePreview, WellnessRuleItem } from '@/types/models/screen-time.model'

type TabKey = 'today' | 'stats' | 'rules' | 'analysis'

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
        <div className='rounded-xl border border-border bg-card p-4 space-y-2'>
            <div className='flex items-center justify-between'>
                <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>{label}</p>
                <Icon size={15} className='text-muted-foreground' />
            </div>
            <p className={cn('text-2xl font-bold', color)}>{value}</p>
        </div>
    )
}

function TodayTab() {
    const t = useTranslations('SnapiStudio.wellness')
    const sessionStartedAt = useAppSelector((s) => s.wellness.sessionStartedAt)
    const todayTotalSeconds = useAppSelector((s) => s.wellness.todayTotalSeconds)
    const todayVideoSeconds = useAppSelector((s) => s.wellness.todayVideoSeconds)

    const elapsedSeconds = sessionStartedAt ? Math.round((Date.now() - sessionStartedAt) / 1000) : 0
    const totalSeconds = todayTotalSeconds + elapsedSeconds

    const { data: statsData, isLoading } = useGetStatsQuery({ period: 'today' })
    const stats = statsData?.data

    if (isLoading) {
        return (
            <div className='grid grid-cols-2 gap-3'>
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className='h-24 rounded-xl' />
                ))}
            </div>
        )
    }

    return (
        <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-3'>
                <StatCard label={t('today.online')} value={formatDuration(totalSeconds)} icon={Clock} color='text-primary' />
                <StatCard label={t('today.watchingVideo')} value={formatDuration(todayVideoSeconds)} icon={HeartPulse} />
                <StatCard label={t('today.comments')} value={stats?.comments_count ?? 0} icon={BarChart2} />
                <StatCard label={t('today.posts')} value={stats?.posts_count ?? 0} icon={BarChart2} />
            </div>

            {stats?.peak_hour !== null && stats?.peak_hour !== undefined && (
                <p className='text-xs text-muted-foreground text-center'>
                    {t('today.peakHour', { hour: stats.peak_hour, hourEnd: stats.peak_hour + 1 })}
                </p>
            )}
        </div>
    )
}

function StatsTab() {
    const t = useTranslations('SnapiStudio.wellness')
    const [period, setPeriod] = useState<WellnessPeriod>(WELLNESS_PERIODS.TODAY)
    const { data: statsData, isLoading } = useGetStatsQuery({ period })
    const stats = statsData?.data

    const PERIODS = [
        { value: WELLNESS_PERIODS.TODAY, label: t('stats.periods.today') },
        { value: WELLNESS_PERIODS.WEEK, label: t('stats.periods.week') },
        { value: WELLNESS_PERIODS.MONTH, label: t('stats.periods.month') }
    ] as const

    return (
        <div className='space-y-5'>
            <div className='flex gap-2'>
                {PERIODS.map((p) => (
                    <button
                        key={p.value}
                        onClick={() => setPeriod(p.value)}
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                            period === p.value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className='grid grid-cols-2 gap-3'>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className='h-24 rounded-xl' />
                    ))}
                </div>
            ) : stats ? (
                <>
                    <div className='grid grid-cols-2 gap-3'>
                        <StatCard label={t('stats.totalTime')} value={formatDuration(stats.total_seconds)} icon={Clock} color='text-primary' />
                        <StatCard label={t('stats.watchingVideo')} value={formatDuration(stats.video_seconds)} icon={HeartPulse} />
                        <StatCard label={t('stats.dailyAvg')} value={formatDuration(stats.avg_daily_seconds)} icon={BarChart2} />
                        <StatCard label={t('stats.sessions')} value={stats.sessions_count} icon={Clock} />
                        <StatCard label={t('stats.comments')} value={stats.comments_count} icon={BarChart2} />
                        <StatCard label={t('stats.posts')} value={stats.posts_count} icon={BarChart2} />
                    </div>

                    {stats.daily_series.length > 0 && (
                        <div className='rounded-xl border border-border bg-card p-4'>
                            <p className='text-sm font-semibold mb-3'>{t('stats.chartTitle')}</p>
                            <ResponsiveContainer width='100%' height={180}>
                                <BarChart
                                    data={stats.daily_series}
                                    margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
                                    <XAxis dataKey='date' tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                                    <YAxis
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={(v) => `${Math.round(v / 60)}m`}
                                    />
                                    <Tooltip formatter={(v: number) => [formatDuration(v), '']} />
                                    <Bar dataKey='seconds' fill='hsl(var(--primary))' radius={[3, 3, 0, 0]} />
                                    <Bar
                                        dataKey='video_seconds'
                                        fill='hsl(var(--primary) / 0.4)'
                                        radius={[3, 3, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </>
            ) : null}
        </div>
    )
}

function RulesTab() {
    const t = useTranslations('SnapiStudio.wellness')
    const [nlText, setNlText] = useState('')
    const [preview, setPreview] = useState<ParsedRulePreview | null>(null)

    const { data: rulesData, isLoading } = useListRulesQuery()
    const [parseNLRule, { isLoading: isParsing }] = useParseNLRuleMutation()
    const [createRule, { isLoading: isCreating }] = useCreateRuleMutation()
    const [updateRule] = useUpdateRuleMutation()
    const [deleteRule] = useDeleteRuleMutation()

    const rules = rulesData?.data ?? []

    const handleParse = async () => {
        if (!nlText.trim()) return
        const res = await parseNLRule({ text: nlText.trim() }).unwrap()
        setPreview(res.data)
    }

    const handleSavePreview = async () => {
        if (!preview) return
        await createRule({
            type: preview.type,
            conditions: preview.conditions,
            action: preview.action,
            title: preview.title,
            message: preview.message,
            natural_language_input: nlText
        }).unwrap()
        setPreview(null)
        setNlText('')
        toast.success(t('rules.toast.saved'))
    }

    const handleToggle = async (rule: WellnessRuleItem) => {
        await updateRule({ uuid: rule.uuid, is_enabled: !rule.is_enabled }).unwrap()
    }

    const handleDelete = async (uuid: string) => {
        await deleteRule(uuid).unwrap()
        toast.success(t('rules.toast.deleted'))
    }

    return (
        <div className='space-y-5'>
            <div className='rounded-xl border border-border bg-card p-4 space-y-3'>
                <p className='text-sm font-semibold flex items-center gap-2'>
                    <Sparkles size={14} className='text-primary' />
                    {t('rules.createTitle')}
                </p>
                <textarea
                    value={nlText}
                    onChange={(e) => setNlText(e.target.value)}
                    placeholder={t('rules.inputPlaceholder')}
                    rows={3}
                    className='w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm resize-none outline-none focus:ring-1 focus:ring-primary/50'
                />
                <Button onClick={handleParse} disabled={!nlText.trim() || isParsing} size='sm' className='gap-2'>
                    {isParsing ? <RefreshCw size={13} className='animate-spin' /> : <Sparkles size={13} />}
                    {isParsing ? t('rules.analyzing') : t('rules.analyzeBtn')}
                </Button>

                {preview && (
                    <div className='rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2'>
                        <div className='flex items-center gap-2 flex-wrap'>
                            <Badge variant='secondary' className='text-xs'>
                                {WELLNESS_RULE_TYPE_LABELS[preview.type]}
                            </Badge>
                            <Badge variant='outline' className='text-xs'>
                                {WELLNESS_ACTION_LABELS[preview.action]}
                            </Badge>
                            <span className='text-xs text-muted-foreground ml-auto'>
                                {t('rules.confidence', { pct: Math.round(preview.confidence * 100) })}
                            </span>
                        </div>
                        <p className='text-sm font-medium'>{preview.title}</p>
                        <p className='text-xs text-muted-foreground'>{preview.message}</p>
                        <Button onClick={handleSavePreview} disabled={isCreating} size='sm' className='w-full gap-2'>
                            <CheckCircle2 size={13} />
                            {t('rules.saveBtn')}
                        </Button>
                    </div>
                )}
            </div>

            <Separator />

            {isLoading ? (
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
                        <div key={rule.uuid} className='rounded-xl border border-border bg-card p-4'>
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
                                    <p className='text-sm font-medium'>{rule.title}</p>
                                    <p className='text-xs text-muted-foreground line-clamp-2'>{rule.message}</p>
                                </div>
                                <div className='flex items-center gap-1 shrink-0'>
                                    <button
                                        type='button'
                                        onClick={() => handleToggle(rule)}
                                        className='text-muted-foreground hover:text-foreground transition-colors'
                                        title={rule.is_enabled ? t('rules.toggleOff') : t('rules.toggleOn')}
                                    >
                                        {rule.is_enabled ? (
                                            <ToggleRight size={22} className='text-primary' />
                                        ) : (
                                            <ToggleLeft size={22} />
                                        )}
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => handleDelete(rule.uuid)}
                                        className='text-muted-foreground hover:text-destructive transition-colors p-1'
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
    )
}

function AnalysisTab() {
    const t = useTranslations('SnapiStudio.wellness')
    const [analyzeUsage, { isLoading, data }] = useAnalyzeUsageMutation()
    const analysis = data?.data

    const [createRule, { isLoading: isCreating }] = useCreateRuleMutation()

    const handleSuggestedRule = async (rule: any) => {
        await createRule({
            type: rule.type,
            conditions: rule.conditions,
            action: rule.action,
            title: rule.title,
            message: rule.message
        }).unwrap()
        toast.success(t('analysis.toast.ruleAdded'))
    }

    return (
        <div className='space-y-4'>
            <Button onClick={() => analyzeUsage()} disabled={isLoading} className='w-full gap-2'>
                {isLoading ? (
                    <>
                        <RefreshCw size={14} className='animate-spin' /> {t('analysis.analyzing')}
                    </>
                ) : (
                    <>
                        <Brain size={14} /> {t('analysis.analyzeBtn')}
                    </>
                )}
            </Button>

            {analysis && (
                <div className='space-y-4'>
                    <div className='rounded-xl border border-border bg-card p-4'>
                        <p className='text-sm leading-relaxed'>{analysis.summary}</p>
                    </div>

                    {analysis.patterns.length > 0 && (
                        <div className='space-y-2'>
                            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                                {t('analysis.trends')}
                            </p>
                            {analysis.patterns.map((p, i) => (
                                <p key={i} className='text-sm'>
                                    → {p}
                                </p>
                            ))}
                        </div>
                    )}

                    {analysis.concerns.length > 0 && (
                        <div className='rounded-xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30 p-3 space-y-1'>
                            <p className='text-xs font-semibold text-yellow-700 dark:text-yellow-400'>
                                {t('analysis.concerns')}
                            </p>
                            {analysis.concerns.map((c, i) => (
                                <p key={i} className='text-xs text-yellow-800 dark:text-yellow-300'>
                                    • {c}
                                </p>
                            ))}
                        </div>
                    )}

                    {analysis.recommendations.length > 0 && (
                        <div className='space-y-2'>
                            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                                {t('analysis.recommendations')}
                            </p>
                            {analysis.recommendations.map((r, i) => (
                                <p key={i} className='text-sm text-muted-foreground'>
                                    ✓ {r}
                                </p>
                            ))}
                        </div>
                    )}

                    {analysis.suggested_rules.length > 0 && (
                        <div className='space-y-3'>
                            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                                {t('analysis.suggestedRules')}
                            </p>
                            {analysis.suggested_rules.map((rule, i) => (
                                <div key={i} className='rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2'>
                                    <div className='flex items-center gap-2'>
                                        <Badge variant='secondary' className='text-xs'>
                                            {WELLNESS_RULE_TYPE_LABELS[rule.type]}
                                        </Badge>
                                    </div>
                                    <p className='text-sm font-medium'>{rule.title}</p>
                                    <p className='text-xs text-muted-foreground'>{rule.rationale}</p>
                                    <Button
                                        size='sm'
                                        variant='outline'
                                        className='w-full gap-1.5 h-7 text-xs'
                                        onClick={() => handleSuggestedRule(rule)}
                                        disabled={isCreating}
                                    >
                                        <Plus size={11} />
                                        {t('analysis.addRule')}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function WellnessPage() {
    const t = useTranslations('SnapiStudio.wellness')
    const [activeTab, setActiveTab] = useState<TabKey>('today')

    const TABS = [
        { key: 'today'    as const, label: t('tabs.today'),    icon: Clock    },
        { key: 'stats'    as const, label: t('tabs.stats'),    icon: BarChart2 },
        { key: 'rules'    as const, label: t('tabs.rules'),    icon: Shield   },
        { key: 'analysis' as const, label: t('tabs.analysis'), icon: Brain    }
    ]

    return (
        <div className='max-w-2xl mx-auto p-4 space-y-6'>
            <div className='flex items-center gap-3'>
                <div className='flex size-9 items-center justify-center rounded-xl bg-primary/10'>
                    <HeartPulse size={18} className='text-primary' />
                </div>
                <div>
                    <h1 className='text-lg font-semibold'>{t('title')}</h1>
                    <p className='text-xs text-muted-foreground'>{t('subtitle')}</p>
                </div>
            </div>

            <div className='flex gap-1 border-b border-border'>
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                            activeTab === key
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                        )}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'today' && <TodayTab />}
            {activeTab === 'stats' && <StatsTab />}
            {activeTab === 'rules' && <RulesTab />}
            {activeTab === 'analysis' && <AnalysisTab />}
        </div>
    )
}
