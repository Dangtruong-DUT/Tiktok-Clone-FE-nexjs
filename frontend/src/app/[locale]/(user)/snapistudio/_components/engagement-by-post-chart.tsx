'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetPostOfUserPagingQuery } from '@/store/services/posts.service'
import useCurrentUserData from '@/hooks/data/useCurrentUserData'
import { useTranslations } from 'next-intl'

const chartConfig = {
    engagement: { label: 'Engagement %', color: 'var(--chart-1)' }
}

export function EngagementByPostChart() {
    const t = useTranslations('SnapiStudio.dashboard.engagementChart')
    const currentUser = useCurrentUserData()

    const { data, isLoading } = useGetPostOfUserPagingQuery(
        { userId: currentUser?.uuid || '', page: 1, per_page: 8 },
        { skip: !currentUser?.uuid }
    )

    const posts = data?.data ?? []

    const chartData = posts
        .map((post) => {
            const views = (post.user_views ?? 0) + (post.guest_views ?? 0)
            const interactions = (post.likes_count ?? 0) + (post.comments_count ?? 0)
            const rate = views > 0 ? Math.round((interactions / views) * 1000) / 10 : 0
            const label = post.content
                ? post.content.slice(0, 14) + (post.content.length > 14 ? '…' : '')
                : `#${post.id}`
            return { label, engagement: rate }
        })
        .filter((d) => d.engagement >= 0)

    if (isLoading) {
        return <Skeleton className='h-[200px] w-full' />
    }

    if (!chartData.length) {
        return (
            <Card className='bg-card border-border/50 rounded-xl shadow-sm'>
                <CardHeader className='pb-2'>
                    <CardTitle className='text-sm font-semibold'>{t('title')}</CardTitle>
                    <CardDescription className='text-xs'>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent className='flex items-center justify-center h-[140px]'>
                    <p className='text-xs text-muted-foreground'>{t('noData')}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className='bg-card border-border/50 rounded-xl shadow-sm'>
            <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-semibold'>{t('title')}</CardTitle>
                <CardDescription className='text-xs'>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className='px-2 pb-3'>
                <ChartContainer config={chartConfig} className='h-[160px] w-full'>
                    <BarChart data={chartData} margin={{ left: 4, right: 4, top: 4, bottom: 4 }}>
                        <CartesianGrid vertical={false} strokeDasharray='3 3' />
                        <XAxis dataKey='label' tickLine={false} axisLine={false} tick={{ fontSize: 9 }} interval={0} />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 10 }}
                            width={28}
                            tickFormatter={(v) => `${v}%`}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent nameKey='label' formatter={(v) => [`${v}%`, t('engagement')]} />
                            }
                        />
                        <Bar dataKey='engagement' fill='var(--color-engagement)' radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
