'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGetAiMetricsQuery } from '@/store/services/admin/admin-ai-studio.service'
import { AI_TIME_PERIODS, type AiTimePeriod } from '@/constants/admin/ai'
import { Card } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Cell
} from 'recharts'
import { Users, Zap, DollarSign, CheckCircle, XCircle, BarChart2 } from 'lucide-react'

const dailyChartConfig = {
    total: {
        label: 'Requests',
        color: 'var(--chart-1)'
    }
} satisfies ChartConfig

const intentChartConfig = {
    count: {
        label: 'Requests',
        color: 'var(--chart-1)'
    }
} satisfies ChartConfig

const INTENT_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    color = 'text-foreground'
}: {
    label: string
    value: string | number
    sub?: string
    icon: React.ElementType
    color?: string
}) {
    return (
        <Card className='p-4 space-y-2'>
            <div className='flex items-center justify-between'>
                <span className='text-xs text-muted-foreground font-medium uppercase tracking-wide'>{label}</span>
                <Icon size={16} className='text-muted-foreground' />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {sub && <p className='text-xs text-muted-foreground'>{sub}</p>}
        </Card>
    )
}

export function AiStudioMetrics() {
    const t = useTranslations('AdminPage')
    const [period, setPeriod] = useState<AiTimePeriod>(AI_TIME_PERIODS.TODAY)
    const { data, isLoading } = useGetAiMetricsQuery({ period })
    const metrics = data?.data

    const PERIODS = [
        { value: AI_TIME_PERIODS.TODAY, label: t('aiStudio.metrics.periods.today') },
        { value: AI_TIME_PERIODS.WEEK, label: t('aiStudio.metrics.periods.week') },
        { value: AI_TIME_PERIODS.MONTH, label: t('aiStudio.metrics.periods.month') }
    ]

    return (
        <div className='space-y-6'>
            <div className='flex gap-2'>
                {PERIODS.map((p) => (
                    <button
                        key={p.value}
                        onClick={() => setPeriod(p.value)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            period === p.value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className='h-24 rounded-xl' />
                    ))}
                </div>
            ) : metrics ? (
                <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'>
                    <StatCard
                        label={t('aiStudio.metrics.stats.totalRequests')}
                        value={metrics.total_requests.toLocaleString()}
                        icon={Zap}
                    />
                    <StatCard
                        label={t('aiStudio.metrics.stats.successRate')}
                        value={`${metrics.success_rate}%`}
                        sub={t('aiStudio.metrics.sub.completed', { count: metrics.completed })}
                        icon={CheckCircle}
                        color={metrics.success_rate >= 80 ? 'text-green-600' : 'text-yellow-600'}
                    />
                    <StatCard
                        label={t('aiStudio.metrics.stats.failed')}
                        value={metrics.failed.toLocaleString()}
                        sub={t('aiStudio.metrics.sub.failureRate', { rate: (100 - metrics.success_rate).toFixed(1) })}
                        icon={XCircle}
                        color={metrics.failed > 0 ? 'text-red-500' : 'text-foreground'}
                    />
                    <StatCard
                        label={t('aiStudio.metrics.stats.uniqueUsers')}
                        value={metrics.unique_users.toLocaleString()}
                        icon={Users}
                    />
                    <StatCard
                        label={t('aiStudio.metrics.stats.estCost')}
                        value={`$${(metrics.total_cost_usd ?? metrics.estimated_cost_usd ?? 0).toFixed(4)}`}
                        sub={t('aiStudio.metrics.sub.tokens', { count: (metrics.total_tokens ?? 0).toLocaleString() })}
                        icon={DollarSign}
                    />
                </div>
            ) : null}

            {!isLoading && metrics && (
                <Card className='p-4'>
                    <h3 className='text-sm font-semibold mb-4'>{t('aiStudio.metrics.charts.dailyRequests')}</h3>
                    {metrics.daily_series.length > 0 ? (
                        <ChartContainer config={dailyChartConfig} className='h-[220px] w-full aspect-auto'>
                            <BarChart data={metrics.daily_series} barSize={16}>
                                <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
                                <XAxis dataKey='date' tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} allowDecimals={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey='total' fill='var(--color-total)' name='Requests' radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <div className='flex flex-col items-center justify-center h-[220px] gap-2 text-muted-foreground'>
                            <BarChart2 size={32} className='opacity-30' />
                            <p className='text-sm'>{t('aiStudio.metrics.empty.noData')}</p>
                        </div>
                    )}
                </Card>
            )}

            {!isLoading && metrics && (() => {
                const intentData = Object.entries(metrics.intent_breakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([intent, count]) => ({ intent: intent.replace(/_/g, ' '), count }))
                return (
                    <Card className='p-4'>
                        <h3 className='text-sm font-semibold mb-4'>{t('aiStudio.metrics.charts.intentBreakdown')}</h3>
                        {intentData.length > 0 ? (
                            <ChartContainer
                                config={intentChartConfig}
                                className='w-full aspect-auto'
                                style={{ height: intentData.length * 36 + 20 }}
                            >
                                <BarChart data={intentData} layout='vertical' barSize={14} margin={{ left: 8, right: 24 }}>
                                    <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' horizontal={false} />
                                    <XAxis
                                        type='number'
                                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                                        allowDecimals={false}
                                    />
                                    <YAxis
                                        type='category'
                                        dataKey='intent'
                                        width={120}
                                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'var(--muted)' }} />
                                    <Bar dataKey='count' name='Requests' radius={[0, 4, 4, 0]}>
                                        {intentData.map((_, i) => (
                                            <Cell key={i} fill={INTENT_COLORS[i % INTENT_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <div className='flex flex-col items-center justify-center h-24 gap-2 text-muted-foreground'>
                                <BarChart2 size={24} className='opacity-30' />
                                <p className='text-sm'>{t('aiStudio.metrics.empty.noIntents')}</p>
                            </div>
                        )}
                    </Card>
                )
            })()}
        </div>
    )
}
