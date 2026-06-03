'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGetAiMetricsQuery } from '@/store/services/admin/admin-ai-studio.service'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { TrendingUp, Users, Zap, DollarSign, CheckCircle, XCircle } from 'lucide-react'

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
    const [period, setPeriod] = useState('today')
    const { data, isLoading } = useGetAiMetricsQuery({ period })
    const metrics = data?.data

    const PERIODS = [
        { value: 'today', label: t('aiStudio.metrics.periods.today') },
        { value: 'week',  label: t('aiStudio.metrics.periods.week') },
        { value: 'month', label: t('aiStudio.metrics.periods.month') }
    ]

    return (
        <div className='space-y-6'>
            {/* Period selector */}
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

            {/* Stat cards */}
            {isLoading ? (
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className='h-24 rounded-xl' />
                    ))}
                </div>
            ) : metrics ? (
                <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
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
                        label={t('aiStudio.metrics.stats.applyRate')}
                        value={`${metrics.apply_rate}%`}
                        sub={t('aiStudio.metrics.sub.suggestionsUsed')}
                        icon={TrendingUp}
                        color='text-blue-600'
                    />
                    <StatCard
                        label={t('aiStudio.metrics.stats.uniqueUsers')}
                        value={metrics.unique_users.toLocaleString()}
                        icon={Users}
                    />
                    <StatCard
                        label={t('aiStudio.metrics.stats.estCost')}
                        value={`$${metrics.estimated_cost_usd.toFixed(4)}`}
                        sub={t('aiStudio.metrics.sub.tokens', { count: metrics.total_tokens.toLocaleString() })}
                        icon={DollarSign}
                    />
                </div>
            ) : null}

            {/* Daily bar chart */}
            {!isLoading && metrics && metrics.daily_series.length > 0 && (
                <Card className='p-4'>
                    <h3 className='text-sm font-semibold mb-4'>{t('aiStudio.metrics.charts.dailyRequests')}</h3>
                    <ResponsiveContainer width='100%' height={220}>
                        <BarChart data={metrics.daily_series} barSize={16}>
                            <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
                            <XAxis dataKey='date' tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{
                                    background: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: 8,
                                    fontSize: 12
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar
                                dataKey='completed'
                                fill='hsl(142 76% 36%)'
                                name={t('aiStudio.metrics.charts.completed')}
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey='failed'
                                fill='hsl(0 84% 60%)'
                                name={t('aiStudio.metrics.charts.failed')}
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            )}

            {/* Intent breakdown */}
            {!isLoading && metrics && Object.keys(metrics.intent_breakdown).length > 0 && (
                <Card className='p-4'>
                    <h3 className='text-sm font-semibold mb-3'>{t('aiStudio.metrics.charts.intentBreakdown')}</h3>
                    <div className='flex flex-wrap gap-2'>
                        {Object.entries(metrics.intent_breakdown)
                            .sort(([, a], [, b]) => b - a)
                            .map(([intent, count]) => (
                                <Badge key={intent} variant='secondary' className='capitalize'>
                                    {intent}: {count}
                                </Badge>
                            ))}
                    </div>
                </Card>
            )}
        </div>
    )
}
