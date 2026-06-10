'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGetAiMetricsQuery } from '@/store/services/admin/admin-ai-studio.service'
import { AI_TIME_PERIODS, type AiTimePeriod } from '@/constants/admin/ai'
import { Card } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    Cell
} from 'recharts'
import {
    Users,
    Zap,
    DollarSign,
    CheckCircle,
    XCircle,
    BarChart2,
    Activity,
    PieChart as PieChartIcon,
    Target
} from 'lucide-react'

const dailyChartConfig = {
    total: {
        label: 'Requests',
        color: 'var(--chart-1)'
    }
} satisfies ChartConfig

const tokenChartConfig = {
    tokens: {
        label: 'Tokens',
        color: 'var(--chart-2)'
    }
} satisfies ChartConfig

const intentChartConfig = {
    count: {
        label: 'Requests',
        color: 'var(--chart-3)'
    }
} satisfies ChartConfig

const INTENT_COLORS = [
    '#f97316', // orange-500
    '#0ea5e9', // sky-500
    '#10b981', // emerald-500
    '#8b5cf6', // violet-500
    '#f43f5e', // rose-500
    '#eab308', // yellow-500
    '#14b8a6', // teal-500
    '#6366f1', // indigo-500
    '#f59e0b', // amber-500
    '#84cc16', // lime-500
    '#3b82f6', // blue-500
    '#ec4899' // pink-500
]

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
        <Card className='p-4 space-y-2 border-border/50 shadow-sm'>
            <div className='flex items-center justify-between'>
                <span className='text-xs text-muted-foreground font-medium uppercase tracking-wide'>{label}</span>
                <Icon size={16} className='text-muted-foreground' />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {sub && <p className='text-xs text-muted-foreground'>{sub}</p>}
        </Card>
    )
}

function EmptyChart({ text }: { text: string }) {
    return (
        <div className='flex flex-col items-center justify-center h-[250px] gap-2 text-muted-foreground'>
            <BarChart2 size={32} className='opacity-30' />
            <p className='text-sm'>{text}</p>
        </div>
    )
}

export function AiStudioMetrics() {
    const t = useTranslations('AdminPage')
    const [period, setPeriod] = useState<AiTimePeriod>(AI_TIME_PERIODS.TODAY)
    const { data, isLoading, isError } = useGetAiMetricsQuery({ period })
    const metrics = data?.data

    const PERIODS = [
        { value: AI_TIME_PERIODS.TODAY, label: t('aiStudio.metrics.periods.today') },
        { value: AI_TIME_PERIODS.WEEK, label: t('aiStudio.metrics.periods.week') },
        { value: AI_TIME_PERIODS.MONTH, label: t('aiStudio.metrics.periods.month') }
    ]

    const intentData = metrics
        ? (() => {
              const totalIntents = Object.values(metrics.intent_breakdown).reduce((a, b) => a + b, 0)
              const threshold = totalIntents * 0.03 // 3%

              const result: { intent: string; count: number }[] = []
              let otherCount = 0

              Object.entries(metrics.intent_breakdown)
                  .sort(([, a], [, b]) => b - a)
                  .forEach(([intent, count]) => {
                      // Group into 'other' if < 3% AND we already have at least 5 slices
                      if (count < threshold && result.length >= 5) {
                          otherCount += count
                      } else {
                          result.push({ intent: intent.replace(/_/g, ' '), count })
                      }
                  })

              if (otherCount > 0) {
                  result.push({ intent: 'other', count: otherCount })
              }

              return result
          })()
        : []

    return (
        <div className='space-y-6'>
            <div className='flex gap-2'>
                {PERIODS.map((p) => (
                    <button
                        key={p.value}
                        onClick={() => setPeriod(p.value)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                            period === p.value
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
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
            ) : isError ? (
                <div className='rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive'>
                    {t('aiStudio.metrics.error')}
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
                <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
                    {/* Area Chart: Daily Requests */}
                    <Card className='p-6 border-border/50 shadow-sm'>
                        <div className='flex items-center gap-2 mb-6'>
                            <Activity size={18} className='text-muted-foreground' />
                            <h3 className='text-sm font-semibold'>{t('aiStudio.metrics.charts.dailyRequests')}</h3>
                        </div>
                        {metrics.daily_series.length > 0 ? (
                            <ChartContainer config={dailyChartConfig} className='h-[250px] w-full aspect-auto'>
                                <AreaChart
                                    data={metrics.daily_series}
                                    margin={{ left: -20, right: 10, top: 10, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id='fillRequests' x1='0' y1='0' x2='0' y2='1'>
                                            <stop offset='5%' stopColor='var(--color-total)' stopOpacity={0.8} />
                                            <stop offset='95%' stopColor='var(--color-total)' stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' vertical={false} />
                                    <XAxis
                                        dataKey='date'
                                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                                        allowDecimals={false}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Area
                                        type='monotone'
                                        dataKey='total'
                                        stroke='var(--color-total)'
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill='url(#fillRequests)'
                                        name='Requests'
                                    />
                                </AreaChart>
                            </ChartContainer>
                        ) : (
                            <EmptyChart text={t('aiStudio.metrics.empty.noData')} />
                        )}
                    </Card>

                    {/* Bar Chart: Daily Tokens */}
                    <Card className='p-6 border-border/50 shadow-sm'>
                        <div className='flex items-center gap-2 mb-6'>
                            <BarChart2 size={18} className='text-muted-foreground' />
                            <h3 className='text-sm font-semibold'>Daily Token Usage</h3>
                        </div>
                        {metrics.daily_series.length > 0 ? (
                            <ChartContainer config={tokenChartConfig} className='h-[250px] w-full aspect-auto'>
                                <BarChart
                                    data={metrics.daily_series}
                                    barSize={24}
                                    margin={{ left: -20, right: 10, top: 10, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' vertical={false} />
                                    <XAxis
                                        dataKey='date'
                                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                                        allowDecimals={false}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <ChartTooltip
                                        cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar
                                        dataKey='tokens'
                                        fill='var(--color-tokens)'
                                        name='Tokens'
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <EmptyChart text={t('aiStudio.metrics.empty.noData')} />
                        )}
                    </Card>

                    {/* Donut Chart: Intent Breakdown */}
                    <Card className='p-6 border-border/50 shadow-sm'>
                        <div className='flex items-center gap-2 mb-6'>
                            <PieChartIcon size={18} className='text-muted-foreground' />
                            <h3 className='text-sm font-semibold'>{t('aiStudio.metrics.charts.intentBreakdown')}</h3>
                        </div>
                        {intentData.length > 0 ? (
                            <ChartContainer config={intentChartConfig} className='h-[250px] w-full aspect-auto'>
                                <PieChart>
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                    <Pie
                                        data={intentData}
                                        dataKey='count'
                                        nameKey='intent'
                                        cx='50%'
                                        cy='50%'
                                        outerRadius={75}
                                        stroke='var(--background)'
                                        strokeWidth={2}
                                        labelLine={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }}
                                        label={({ x, y, cx, cy, percent }) => {
                                            return (
                                                <text
                                                    x={x}
                                                    y={y}
                                                    fill='var(--foreground)'
                                                    textAnchor={x > cx ? 'start' : 'end'}
                                                    dominantBaseline='central'
                                                    fontSize={12}
                                                >
                                                    {`${(percent * 100).toFixed(1)}%`}
                                                </text>
                                            )
                                        }}
                                    >
                                        {intentData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={INTENT_COLORS[index % INTENT_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Legend
                                        wrapperStyle={{ fontSize: 12, marginTop: '20px' }}
                                        formatter={(value) => (
                                            <span style={{ color: 'var(--foreground)' }}>{value}</span>
                                        )}
                                    />
                                </PieChart>
                            </ChartContainer>
                        ) : (
                            <EmptyChart text={t('aiStudio.metrics.empty.noIntents')} />
                        )}
                    </Card>

                    {/* Radar Chart: Intent Profile */}
                    <Card className='p-6 border-border/50 shadow-sm'>
                        <div className='flex items-center gap-2 mb-6'>
                            <Target size={18} className='text-muted-foreground' />
                            <h3 className='text-sm font-semibold'>Intent Radar Profile</h3>
                        </div>
                        {intentData.length > 0 ? (
                            <ChartContainer config={intentChartConfig} className='h-[250px] w-full aspect-auto'>
                                <RadarChart cx='50%' cy='50%' outerRadius={75} data={intentData}>
                                    <PolarGrid stroke='var(--border)' />
                                    <PolarAngleAxis
                                        dataKey='intent'
                                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                                    />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Radar
                                        name='Requests'
                                        dataKey='count'
                                        stroke='var(--color-count)'
                                        fill='var(--color-count)'
                                        fillOpacity={0.5}
                                    />
                                </RadarChart>
                            </ChartContainer>
                        ) : (
                            <EmptyChart text={t('aiStudio.metrics.empty.noIntents')} />
                        )}
                    </Card>
                </div>
            )}
        </div>
    )
}
