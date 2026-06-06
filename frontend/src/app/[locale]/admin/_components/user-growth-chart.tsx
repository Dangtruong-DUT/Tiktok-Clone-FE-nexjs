'use client'

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetDashboardStatsQuery } from '@/store/services/admin'
import { useTranslations } from 'next-intl'

const chartConfig = {
    count: { color: 'var(--chart-1)' }
}

export function UserGrowthChart() {
    const t = useTranslations('AdminPage.dashboard')
    const { data, isLoading } = useGetDashboardStatsQuery({ period: 'week' })
    const series = data?.data.user_daily_series ?? []

    const formatted = series.map((p) => ({
        date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: p.count
    }))

    if (isLoading) {
        return <Skeleton className='h-[220px] w-full' />
    }

    return (
        <Card className='bg-card border-border/50 rounded-xl shadow-sm'>
            <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-semibold'>{t('userGrowthChart.title')}</CardTitle>
                <CardDescription className='text-xs'>{t('userGrowthChart.description')}</CardDescription>
            </CardHeader>
            <CardContent className='px-2 pb-3'>
                <ChartContainer config={chartConfig} className='h-[160px] w-full'>
                    <LineChart data={formatted} margin={{ left: 4, right: 4, top: 4 }}>
                        <CartesianGrid vertical={false} strokeDasharray='3 3' />
                        <XAxis
                            dataKey='date'
                            tickLine={false}
                            axisLine={false}
                            tickMargin={6}
                            tick={{ fontSize: 10 }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={4}
                            tick={{ fontSize: 10 }}
                            allowDecimals={false}
                            width={24}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    labelKey='date'
                                    nameKey='count'
                                    formatter={(v) => [v, t('userGrowthChart.users')]}
                                />
                            }
                        />
                        <Line
                            dataKey='count'
                            type='monotone'
                            stroke='var(--color-count)'
                            strokeWidth={2}
                            dot={{ r: 3, fill: 'var(--color-count)' }}
                            activeDot={{ r: 4 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
