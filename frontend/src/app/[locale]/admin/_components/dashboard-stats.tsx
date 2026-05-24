'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/utils/formatting/format-number.util'
import type { DashboardStats } from '@/types/dtos/admin/admin-response.dto'
import { useGetDashboardStatsQuery } from '@/store/services/admin'
import { Users, Video, ShieldOff, Activity } from 'lucide-react'

interface DashboardStatsProps {
    stats?: DashboardStats
    period?: 'today' | 'week' | 'month' | 'year'
    isLoading?: boolean
}

export function DashboardStats({ stats, period = 'today', isLoading }: DashboardStatsProps) {
    const t = useTranslations('AdminPage')
    const { data, isLoading: isStatsLoading } = useGetDashboardStatsQuery({ period }, { skip: !!stats })
    const resolvedStats = stats ?? data?.data

    if (!resolvedStats) {
        return null
    }

    if (isLoading || isStatsLoading) {
        return (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className='animate-pulse'>
                        <CardHeader>
                            <div className='h-4 bg-muted rounded w-20' />
                        </CardHeader>
                        <CardContent>
                            <div className='h-8 bg-muted rounded w-16' />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    const cards = [
        {
            title: t('dashboard.totalUsers'),
            value: formatNumber(resolvedStats.total_users),
            icon: Users,
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-950/40'
        },
        {
            title: t('dashboard.totalPosts'),
            value: formatNumber(resolvedStats.total_posts),
            icon: Video,
            iconColor: 'text-purple-500',
            bgColor: 'bg-purple-50 dark:bg-purple-950/40'
        },
        {
            title: t('dashboard.bannedUsers'),
            value: formatNumber(resolvedStats.banned_users),
            icon: ShieldOff,
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50 dark:bg-red-950/40'
        },
        {
            title: t('dashboard.adminActions'),
            value: formatNumber(resolvedStats.total_admin_actions),
            icon: Activity,
            iconColor: 'text-emerald-500',
            bgColor: 'bg-emerald-50 dark:bg-emerald-950/40'
        }
    ]

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {cards.map((card) => {
                const Icon = card.icon
                return (
                    <Card key={card.title} className='hover:shadow-lg transition-shadow'>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
                            <div className={`rounded-lg p-2 ${card.bgColor}`}>
                                <Icon className={`h-4 w-4 ${card.iconColor}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>{card.value}</div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
