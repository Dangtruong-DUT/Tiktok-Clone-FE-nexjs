'use client'

import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useListStudioPostsQuery } from '@/store/services/studio-post-schedule.service'
import { useTranslations } from 'next-intl'

const STATUS_COLORS = {
    published: 'var(--chart-2)',
    scheduled: 'var(--chart-3)',
    draft: 'var(--chart-4)'
} as const

const chartConfig = {
    count: { color: 'var(--chart-2)' }
}

export function PostStatusChart() {
    const t = useTranslations('SnapiStudio.dashboard.postStatusChart')

    const { data: published, isLoading: l1 } = useListStudioPostsQuery({ status: 'published', per_page: 1 })
    const { data: scheduled, isLoading: l2 } = useListStudioPostsQuery({ status: 'scheduled', per_page: 1 })
    const { data: draft, isLoading: l3 } = useListStudioPostsQuery({ status: 'draft', per_page: 1 })

    const isLoading = l1 || l2 || l3

    const getTotal = (res: typeof published) => {
        const meta = res?.meta
        if (!meta) return 0
        if (meta.type === 'offset') return meta.total ?? res?.data?.length ?? 0
        return res?.data?.length ?? 0
    }

    const chartData = [
        { status: t('published'), count: getTotal(published), key: 'published' },
        { status: t('scheduled'), count: getTotal(scheduled), key: 'scheduled' },
        { status: t('draft'), count: getTotal(draft), key: 'draft' }
    ]

    if (isLoading) {
        return <Skeleton className='h-[200px] w-full' />
    }

    return (
        <Card className='bg-card border-border/50 rounded-xl shadow-sm'>
            <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-semibold'>{t('title')}</CardTitle>
                <CardDescription className='text-xs'>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className='px-2 pb-3'>
                <ChartContainer config={chartConfig} className='h-[140px] w-full'>
                    <BarChart data={chartData} layout='vertical' margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                        <XAxis type='number' hide allowDecimals={false} />
                        <YAxis
                            type='category'
                            dataKey='status'
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11 }}
                            width={68}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent nameKey='status' formatter={(v) => [v, t('posts')]} />}
                        />
                        <Bar dataKey='count' radius={[0, 4, 4, 0]}>
                            {chartData.map((item) => (
                                <Cell key={item.key} fill={STATUS_COLORS[item.key as keyof typeof STATUS_COLORS]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
