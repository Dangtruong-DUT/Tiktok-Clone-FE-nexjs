'use client'

import { useState, useCallback } from 'react'
import { HeartPulse, Clock, BarChart2, Shield, Brain, Plus, Trash2, ToggleLeft, ToggleRight, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAppSelector } from '@/store/hooks'
import {
    useGetStatsQuery,
} from '@/store/services/screen-time.service'
import {
    useListRulesQuery,
    useCreateRuleMutation,
    useUpdateRuleMutation,
    useDeleteRuleMutation,
    useParseNLRuleMutation,
    useAnalyzeUsageMutation,
} from '@/store/services/wellness-rule.service'
import { WELLNESS_RULE_TYPE_LABELS, WELLNESS_ACTION_LABELS, WELLNESS_PERIODS } from '@/constants/wellness'
import type { WellnessPeriod, ParsedRulePreview, WellnessRuleItem } from '@/types/models/screen-time.model'


const TABS = [
    { key: 'today',    label: 'Hôm nay',    icon: Clock      },
    { key: 'stats',    label: 'Thống kê',   icon: BarChart2  },
    { key: 'rules',    label: 'Quy tắc',    icon: Shield     },
    { key: 'analysis', label: 'AI Phân tích', icon: Brain    },
] as const

type TabKey = (typeof TABS)[number]['key']

const PERIODS = [
    { value: WELLNESS_PERIODS.TODAY, label: 'Hôm nay' },
    { value: WELLNESS_PERIODS.WEEK,  label: 'Tuần này' },
    { value: WELLNESS_PERIODS.MONTH, label: 'Tháng này' },
] as const


function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return h > 0 ? `${h}g ${m}p` : `${m} phút`
}


function StatCard({ label, value, icon: Icon, color = '' }: { label: string; value: string | number; icon: React.ElementType; color?: string }) {
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
    const sessionStartedAt  = useAppSelector((s) => s.wellness.sessionStartedAt)
    const todayTotalSeconds = useAppSelector((s) => s.wellness.todayTotalSeconds)
    const todayVideoSeconds = useAppSelector((s) => s.wellness.todayVideoSeconds)

    const elapsedSeconds  = sessionStartedAt ? Math.round((Date.now() - sessionStartedAt) / 1000) : 0
    const totalSeconds    = todayTotalSeconds + elapsedSeconds

    const { data: statsData, isLoading } = useGetStatsQuery({ period: 'today' })
    const stats = statsData?.data

    if (isLoading) return <div className='grid grid-cols-2 gap-3'>{Array.from({length:4}).map((_,i) => <Skeleton key={i} className='h-24 rounded-xl' />)}</div>

    return (
        <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-3'>
                <StatCard label='Online'      value={formatDuration(totalSeconds)}                    icon={Clock}     color='text-primary' />
                <StatCard label='Xem video'   value={formatDuration(todayVideoSeconds)}               icon={HeartPulse} />
                <StatCard label='Bình luận'   value={stats?.comments_count ?? 0}                     icon={BarChart2} />
                <StatCard label='Bài đăng'    value={stats?.posts_count ?? 0}                        icon={BarChart2} />
            </div>

            {stats?.peak_hour !== null && stats?.peak_hour !== undefined && (
                <p className='text-xs text-muted-foreground text-center'>
                    Thời điểm sử dụng nhiều nhất: <strong>{stats.peak_hour}:00 – {stats.peak_hour + 1}:00</strong>
                </p>
            )}
        </div>
    )
}

function StatsTab() {
    const [period, setPeriod] = useState<WellnessPeriod>(WELLNESS_PERIODS.TODAY)
    const { data: statsData, isLoading } = useGetStatsQuery({ period })
    const stats = statsData?.data

    return (
        <div className='space-y-5'>
            <div className='flex gap-2'>
                {PERIODS.map((p) => (
                    <button
                        key={p.value}
                        onClick={() => setPeriod(p.value)}
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                            period === p.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className='grid grid-cols-2 gap-3'>{Array.from({length:4}).map((_,i) => <Skeleton key={i} className='h-24 rounded-xl' />)}</div>
            ) : stats ? (
                <>
                    <div className='grid grid-cols-2 gap-3'>
                        <StatCard label='Tổng thời gian'   value={formatDuration(stats.total_seconds)}     icon={Clock}     color='text-primary' />
                        <StatCard label='Xem video'         value={formatDuration(stats.video_seconds)}     icon={HeartPulse} />
                        <StatCard label='Trung bình/ngày'   value={formatDuration(stats.avg_daily_seconds)} icon={BarChart2} />
                        <StatCard label='Số phiên'          value={stats.sessions_count}                   icon={Clock} />
                        <StatCard label='Bình luận'         value={stats.comments_count}                   icon={BarChart2} />
                        <StatCard label='Bài đăng'          value={stats.posts_count}                      icon={BarChart2} />
                    </div>

                    {stats.daily_series.length > 0 && (
                        <div className='rounded-xl border border-border bg-card p-4'>
                            <p className='text-sm font-semibold mb-3'>Theo ngày</p>
                            <ResponsiveContainer width='100%' height={180}>
                                <BarChart data={stats.daily_series} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
                                    <XAxis dataKey='date' tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${Math.round(v/60)}p`} />
                                    <Tooltip formatter={(v: number) => [formatDuration(v), '']} />
                                    <Bar dataKey='seconds'       name='Tổng'  fill='hsl(var(--primary))' radius={[3,3,0,0]} />
                                    <Bar dataKey='video_seconds' name='Video' fill='hsl(var(--primary) / 0.4)' radius={[3,3,0,0]} />
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
    const [nlText,   setNlText]   = useState('')
    const [preview,  setPreview]  = useState<ParsedRulePreview | null>(null)

    const { data: rulesData, isLoading } = useListRulesQuery()
    const [parseNLRule,  { isLoading: isParsing }]  = useParseNLRuleMutation()
    const [createRule,   { isLoading: isCreating }] = useCreateRuleMutation()
    const [updateRule]                              = useUpdateRuleMutation()
    const [deleteRule]                              = useDeleteRuleMutation()

    const rules = rulesData?.data ?? []

    const handleParse = async () => {
        if (!nlText.trim()) return
        const res = await parseNLRule({ text: nlText.trim() }).unwrap()
        setPreview(res.data)
    }

    const handleSavePreview = async () => {
        if (!preview) return
        await createRule({
            type:                   preview.type,
            conditions:             preview.conditions,
            action:                 preview.action,
            title:                  preview.title,
            message:                preview.message,
            natural_language_input: nlText,
        }).unwrap()
        setPreview(null)
        setNlText('')
        toast.success('Quy tắc đã được lưu!')
    }

    const handleToggle = async (rule: WellnessRuleItem) => {
        await updateRule({ uuid: rule.uuid, is_enabled: !rule.is_enabled }).unwrap()
    }

    const handleDelete = async (uuid: string) => {
        await deleteRule(uuid).unwrap()
        toast.success('Đã xóa quy tắc.')
    }

    return (
        <div className='space-y-5'>
            {/* NL Input */}
            <div className='rounded-xl border border-border bg-card p-4 space-y-3'>
                <p className='text-sm font-semibold flex items-center gap-2'>
                    <Sparkles size={14} className='text-primary' />
                    Tạo rule bằng ngôn ngữ tự nhiên
                </p>
                <textarea
                    value={nlText}
                    onChange={e => setNlText(e.target.value)}
                    placeholder='Ví dụ: Nhắc tôi nghỉ ngơi nếu lướt video quá 2 tiếng'
                    rows={3}
                    className='w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm resize-none outline-none focus:ring-1 focus:ring-primary/50'
                />
                <Button onClick={handleParse} disabled={!nlText.trim() || isParsing} size='sm' className='gap-2'>
                    {isParsing ? <RefreshCw size={13} className='animate-spin' /> : <Sparkles size={13} />}
                    Phân tích bằng AI
                </Button>

                {/* Preview */}
                {preview && (
                    <div className='rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2'>
                        <div className='flex items-center gap-2 flex-wrap'>
                            <Badge variant='secondary' className='text-xs'>{WELLNESS_RULE_TYPE_LABELS[preview.type]}</Badge>
                            <Badge variant='outline' className='text-xs'>{WELLNESS_ACTION_LABELS[preview.action]}</Badge>
                            <span className='text-xs text-muted-foreground ml-auto'>Độ chắc chắn: {Math.round(preview.confidence * 100)}%</span>
                        </div>
                        <p className='text-sm font-medium'>{preview.title}</p>
                        <p className='text-xs text-muted-foreground'>{preview.message}</p>
                        <Button onClick={handleSavePreview} disabled={isCreating} size='sm' className='w-full gap-2'>
                            <CheckCircle2 size={13} />
                            Lưu rule này
                        </Button>
                    </div>
                )}
            </div>

            <Separator />

            {/* Rule list */}
            {isLoading ? (
                <div className='space-y-2'>{Array.from({length:2}).map((_,i) => <Skeleton key={i} className='h-20 rounded-xl' />)}</div>
            ) : rules.length === 0 ? (
                <div className='flex flex-col items-center gap-2 py-8 text-center'>
                    <Shield size={32} className='text-muted-foreground/30' />
                    <p className='text-sm text-muted-foreground'>Chưa có quy tắc nào. Tạo bằng AI hoặc thêm thủ công.</p>
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
                                            <Badge variant='outline' className='text-xs text-muted-foreground'>Đã tắt</Badge>
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
                                        title={rule.is_enabled ? 'Tắt' : 'Bật'}
                                    >
                                        {rule.is_enabled
                                            ? <ToggleRight size={22} className='text-primary' />
                                            : <ToggleLeft  size={22} />
                                        }
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
    const [analyzeUsage, { isLoading, data }] = useAnalyzeUsageMutation()
    const analysis = data?.data

    const { data: rulesData } = useListRulesQuery()
    const [createRule, { isLoading: isCreating }] = useCreateRuleMutation()

    const handleSuggestedRule = async (rule: any) => {
        await createRule({
            type:       rule.type,
            conditions: rule.conditions,
            action:     rule.action,
            title:      rule.title,
            message:    rule.message,
        }).unwrap()
        toast.success('Quy tắc đã được thêm!')
    }

    return (
        <div className='space-y-4'>
            <Button
                onClick={() => analyzeUsage()}
                disabled={isLoading}
                className='w-full gap-2'
            >
                {isLoading
                    ? <><RefreshCw size={14} className='animate-spin' /> Đang phân tích...</>
                    : <><Brain size={14} /> Phân tích 7 ngày gần đây</>
                }
            </Button>

            {analysis && (
                <div className='space-y-4'>
                    {/* Summary */}
                    <div className='rounded-xl border border-border bg-card p-4'>
                        <p className='text-sm leading-relaxed'>{analysis.summary}</p>
                    </div>

                    {/* Patterns */}
                    {analysis.patterns.length > 0 && (
                        <div className='space-y-2'>
                            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Xu hướng</p>
                            {analysis.patterns.map((p, i) => (
                                <p key={i} className='text-sm'>→ {p}</p>
                            ))}
                        </div>
                    )}

                    {/* Concerns */}
                    {analysis.concerns.length > 0 && (
                        <div className='rounded-xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30 p-3 space-y-1'>
                            <p className='text-xs font-semibold text-yellow-700 dark:text-yellow-400'>Đáng chú ý</p>
                            {analysis.concerns.map((c, i) => <p key={i} className='text-xs text-yellow-800 dark:text-yellow-300'>• {c}</p>)}
                        </div>
                    )}

                    {/* Recommendations */}
                    {analysis.recommendations.length > 0 && (
                        <div className='space-y-2'>
                            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Khuyến nghị</p>
                            {analysis.recommendations.map((r, i) => (
                                <p key={i} className='text-sm text-muted-foreground'>✓ {r}</p>
                            ))}
                        </div>
                    )}

                    {/* Suggested rules */}
                    {analysis.suggested_rules.length > 0 && (
                        <div className='space-y-3'>
                            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Quy tắc gợi ý</p>
                            {analysis.suggested_rules.map((rule, i) => (
                                <div key={i} className='rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2'>
                                    <div className='flex items-center gap-2'>
                                        <Badge variant='secondary' className='text-xs'>{WELLNESS_RULE_TYPE_LABELS[rule.type]}</Badge>
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
                                        Thêm rule này
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
    const [activeTab, setActiveTab] = useState<TabKey>('today')

    return (
        <div className='max-w-2xl mx-auto p-4 space-y-6'>
            {/* Header */}
            <div className='flex items-center gap-3'>
                <div className='flex size-9 items-center justify-center rounded-xl bg-primary/10'>
                    <HeartPulse size={18} className='text-primary' />
                </div>
                <div>
                    <h1 className='text-lg font-semibold'>Digital Wellness</h1>
                    <p className='text-xs text-muted-foreground'>Theo dõi và cân bằng thời gian sử dụng</p>
                </div>
            </div>

            {/* Tabs */}
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

            {/* Tab content */}
            {activeTab === 'today'    && <TodayTab />}
            {activeTab === 'stats'    && <StatsTab />}
            {activeTab === 'rules'    && <RulesTab />}
            {activeTab === 'analysis' && <AnalysisTab />}
        </div>
    )
}
