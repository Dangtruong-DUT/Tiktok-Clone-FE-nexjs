'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/utils/formatting/formatNumber.util'
import type { DashboardStats } from '@/types/dtos/admin/admin-response.dto'
import { useGetDashboardStatsQuery } from '@/store/services/admin'
import { cn } from '@/lib/utils'
import { Users, FileVideo, MessageSquare, Shield } from 'lucide-react'

interface DashboardStatsProps {
    stats?: DashboardStats
    period?: 'today' | 'week' | 'month' | 'year'
    isLoading?: boolean
}

/**
 * DashboardStats - Display key statistics dashboard cards
 * Shows: total users, posts, comments, admin actions
 */
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
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            title: t('dashboard.totalPosts'),
            value: formatNumber(resolvedStats.total_posts),
            icon: FileVideo,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            title: t('dashboard.bannedUsers'),
            value: formatNumber(resolvedStats.banned_users),
            icon: Shield,
            color: 'text-red-600',
            bgColor: 'bg-red-100'
        },
        {
            title: t('dashboard.adminActions'),
            value: formatNumber(resolvedStats.total_admin_actions),
            icon: MessageSquare,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
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
                            <div className={cn('p-2 rounded-lg', card.bgColor)}>
                                <Icon className={cn('w-4 h-4', card.color)} />
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
