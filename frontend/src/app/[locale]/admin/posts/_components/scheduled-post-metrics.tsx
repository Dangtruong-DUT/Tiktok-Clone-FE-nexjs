'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { RefreshCw, CheckCircle2, XCircle, Clock, Zap, TrendingUp } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetScheduledPostMetricsQuery } from '@/store/services/admin/admin-scheduled-posts.service'
import { formatCompactNumber } from '@/utils/formatting/format-number.util'

const PERIODS = ['today', 'week', 'month', 'year'] as const
type Period = (typeof PERIODS)[number]

function StatCard({
    label,
    value,
    icon: Icon,
    className
}: {
    label: string
    value: number | string
    icon: React.ElementType
    className?: string
}) {
    return (
        <div className='rounded-lg border bg-card p-3 flex items-center gap-3'>
            <div className={`flex size-8 shrink-0 items-center justify-center rounded-md ${className ?? 'bg-muted'}`}>
                <Icon className='size-4' />
            </div>
            <div className='min-w-0'>
                <p className='text-xs text-muted-foreground truncate'>{label}</p>
                <p className='text-base font-semibold tabular-nums'>{value}</p>
            </div>
        </div>
    )
}

export function ScheduledPostMetrics() {
    const t = useTranslations('AdminPage')
    const [period, setPeriod] = useState<Period>('week')

    const { data, isLoading } = useGetScheduledPostMetricsQuery({ period })
    const metrics = data?.data

    if (isLoading) {
        return (
            <div className='space-y-4'>
                <Skeleton className='h-9 w-36' />
                <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5'>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className='h-16 rounded-lg' />
                    ))}
                </div>
            </div>
        )
    }

    if (!metrics) return null

    const successRate = metrics.success_rate != null ? `${metrics.success_rate.toFixed(1)}%` : '—'
    const avgDelay =
        metrics.avg_delay_minutes != null ? `${Math.round(metrics.avg_delay_minutes)}m` : '—'

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <p className='text-sm font-medium text-muted-foreground'>
                    {t('scheduledPosts.tabs.metrics')}
                </p>
                <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
                    <SelectTrigger className='h-8 w-28 text-xs'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {PERIODS.map((p) => (
                            <SelectItem key={p} value={p} className='text-xs'>
                                {t(`scheduledPosts.metrics.periods.${p}`)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5'>
                <StatCard
                    label={t('scheduledPosts.metrics.stats.totalScheduled')}
                    value={formatCompactNumber(metrics.total)}
                    icon={RefreshCw}
                    className='bg-muted text-muted-foreground'
                />
                <StatCard
                    label={t('scheduledPosts.metrics.stats.pending')}
                    value={formatCompactNumber(metrics.pending)}
                    icon={Clock}
                    className='bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                />
                <StatCard
                    label={t('scheduledPosts.metrics.stats.published')}
                    value={formatCompactNumber(metrics.published)}
                    icon={CheckCircle2}
                    className='bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                />
                <StatCard
                    label={t('scheduledPosts.metrics.stats.failed')}
                    value={formatCompactNumber(metrics.failed)}
                    icon={XCircle}
                    className='bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                />
                <StatCard
                    label={t('scheduledPosts.metrics.stats.cancelled')}
                    value={formatCompactNumber(metrics.cancelled)}
                    icon={XCircle}
                    className='bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
                />
            </div>

            <div className='flex flex-wrap gap-4 text-xs text-muted-foreground'>
                <span className='flex items-center gap-1.5'>
                    <TrendingUp className='size-3.5' />
                    {t('scheduledPosts.metrics.stats.successRate')}:{' '}
                    <strong className='text-foreground'>{successRate}</strong>
                </span>
                <span className='flex items-center gap-1.5'>
                    <Zap className='size-3.5' />
                    {t('scheduledPosts.metrics.stats.avgDelay')}:{' '}
                    <strong className='text-foreground'>{avgDelay}</strong>
                </span>
            </div>

            {metrics.top_schedulers.length > 0 && (
                <div>
                    <p className='mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
                        {t('scheduledPosts.metrics.topSchedulers.title')}
                    </p>
                    <div className='space-y-1.5'>
                        {metrics.top_schedulers.slice(0, 5).map((s) => (
                            <div key={s.uuid} className='flex items-center justify-between text-xs'>
                                <span className='font-medium'>@{s.username}</span>
                                <span className='tabular-nums text-muted-foreground'>
                                    {s.published}/{s.total}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
