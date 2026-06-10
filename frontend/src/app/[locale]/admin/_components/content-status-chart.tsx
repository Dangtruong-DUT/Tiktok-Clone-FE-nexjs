'use client'

import { Cell, Pie, PieChart } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetDashboardStatsQuery } from '@/store/services/admin'
import { useTranslations } from 'next-intl'

const COLORS = ['var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)']

export function ContentStatusChart() {
    const t = useTranslations('AdminPage.dashboard')
    const { data, isLoading } = useGetDashboardStatsQuery({ period: 'week' })
    const counts = data?.data.post_status_counts

    const chartConfig = {
        published: { label: t('contentStatusChart.published'), color: COLORS[0] },
        scheduled: { label: t('contentStatusChart.scheduled'), color: COLORS[1] },
        draft: { label: t('contentStatusChart.draft'), color: COLORS[2] }
    }

    const chartData = counts
        ? [
              { name: 'published', label: t('contentStatusChart.published'), value: counts.published },
              { name: 'scheduled', label: t('contentStatusChart.scheduled'), value: counts.scheduled },
              { name: 'draft', label: t('contentStatusChart.draft'), value: counts.draft }
          ].filter((d) => d.value > 0)
        : []

    const total = chartData.reduce((s, d) => s + d.value, 0)

    if (isLoading) {
        return <Skeleton className='h-[220px] w-full' />
    }

    return (
        <Card className='bg-card border-border/50 rounded-xl shadow-sm'>
            <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-semibold'>{t('contentStatusChart.title')}</CardTitle>
                <CardDescription className='text-xs'>{t('contentStatusChart.description')}</CardDescription>
            </CardHeader>
            <CardContent className='px-2 pb-3'>
                <div className='flex items-center gap-4'>
                    <ChartContainer config={chartConfig} className='h-[140px] w-[140px] shrink-0'>
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey='label' hideLabel />} />
                            <Pie
                                data={chartData}
                                dataKey='value'
                                nameKey='label'
                                cx='50%'
                                cy='50%'
                                innerRadius={42}
                                outerRadius={62}
                                paddingAngle={2}
                            >
                                {chartData.map((_, idx) => (
                                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>

                    <div className='flex flex-col gap-2 min-w-0'>
                        {chartData.map((item, idx) => (
                            <div key={item.name} className='flex items-center gap-2 text-xs'>
                                <span
                                    className='size-2.5 rounded-full shrink-0'
                                    style={{ background: COLORS[idx % COLORS.length] }}
                                />
                                <span className='text-muted-foreground truncate'>{item.label}</span>
                                <span className='font-semibold ml-auto tabular-nums'>{item.value}</span>
                                {total > 0 && (
                                    <span className='text-muted-foreground tabular-nums'>
                                        {Math.round((item.value / total) * 100)}%
                                    </span>
                                )}
                            </div>
                        ))}
                        {total === 0 && <p className='text-xs text-muted-foreground'>No posts yet</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
