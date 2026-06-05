'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCompactNumber } from '@/utils/formatting/format-number.util'
import type { DashboardStats } from '@/types/dtos/admin/admin-response.dto'
import { useGetDashboardStatsQuery } from '@/store/services/admin'
import { Users, Video, ShieldOff, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardConfig {
    titleKey: string
    getValue: (s: DashboardStats) => number
    getSubValue: (s: DashboardStats) => number | null
    subKey: string | null
    icon: LucideIcon
    iconClass: string
    subClass: string
}

const STAT_CARDS: StatCardConfig[] = [
    {
        titleKey: 'dashboard.totalUsers',
        getValue: (s) => s.total_users,
        getSubValue: (s) => s.new_users_this_period,
        subKey: 'dashboard.thisPeriod',
        icon: Users,
        iconClass: 'text-blue-400',
        subClass: 'text-blue-400',
    },
    {
        titleKey: 'dashboard.totalPosts',
        getValue: (s) => s.total_posts,
        getSubValue: (s) => s.new_posts_this_period,
        subKey: 'dashboard.thisPeriod',
        icon: Video,
        iconClass: 'text-purple-400',
        subClass: 'text-purple-400',
    },
    {
        titleKey: 'dashboard.bannedUsers',
        getValue: (s) => s.banned_users,
        getSubValue: () => null,
        subKey: null,
        icon: ShieldOff,
        iconClass: 'text-red-400',
        subClass: 'text-red-400',
    },
    {
        titleKey: 'dashboard.adminActions',
        getValue: (s) => s.total_admin_actions,
        getSubValue: () => null,
        subKey: 'dashboard.today',
        icon: Activity,
        iconClass: 'text-emerald-400',
        subClass: 'text-emerald-400',
    },
]

interface DashboardStatsProps {
    stats?: DashboardStats
    period?: 'today' | 'week' | 'month' | 'year'
}

export function DashboardStats({ stats, period = 'today' }: DashboardStatsProps) {
    const t = useTranslations('AdminPage')
    const { data, isLoading } = useGetDashboardStatsQuery({ period }, { skip: !!stats })
    const resolvedStats = stats ?? data?.data

    if (isLoading) {
        return (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className='h-28' />
                ))}
            </div>
        )
    }

    if (!resolvedStats) return null

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {STAT_CARDS.map((card) => {
                const Icon = card.icon
                const value = card.getValue(resolvedStats)
                const subValue = card.getSubValue(resolvedStats)

                return (
                    <Card key={card.titleKey} className='bg-card border-border'>
                        <CardContent className='p-5'>
                            <div className='flex items-start justify-between'>
                                <div className='min-w-0'>
                                    <p className='text-xs font-medium text-muted-foreground'>
                                        {t(card.titleKey as Parameters<typeof t>[0])}
                                    </p>
                                    <p className='mt-1.5 text-2xl font-bold tracking-tight text-foreground'>
                                        {formatCompactNumber(value)}
                                    </p>
                                    {card.subKey && (
                                        <p className={cn('mt-1 text-xs font-medium', card.subClass)}>
                                            {subValue !== null
                                                ? t('dashboard.thisPeriod', { count: `+${subValue}` })
                                                : t(card.subKey as Parameters<typeof t>[0])}
                                        </p>
                                    )}
                                </div>
                                <div className='shrink-0 rounded-lg bg-white/5 p-2'>
                                    <Icon className={cn('h-5 w-5', card.iconClass)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
