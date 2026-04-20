'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useGetActivityLogsQuery } from '@/store/services/admin/index'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AutoPagination from '@/components/auto-pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatAdminDate, getActivityLabel, truncateText } from '@/helpers/admin-helpers'
import { timeAgo } from '@/utils/formatting/formatTime.util'
import type { LocalesType } from '@/i18n/config'
import { Search, AlertCircle } from 'lucide-react'
import { ACTIVITY_TYPES } from '@/constants/admin.const'
import { AdminActivityListItem } from '@/types/dtos/admin/admin-response.dto'
import type { PaginationMeta } from '@/types/common/pagination-meta.type'

interface ActivityLogProps {
    type?: 'all' | 'admin' | 'system'
}

interface ActivityLogsApiResponse {
    data: AdminActivityListItem[]
    meta?: PaginationMeta
}

const DATE_FORMATTER = new Intl.DateTimeFormat('en-CA')

/**
 * ActivityLog - Displays paginated list of system activity and admin actions
 * Features:
 * - Filter by activity type
 * - Time period filter (24h, 7d, 30d, all)
 * - Search by resource
 * - Pagination
 * - Activity type badges
 * - Relative time display (e.g., "2h ago")
 */
export function ActivityLog({ type = 'all' }: ActivityLogProps) {
    const t = useTranslations('AdminPage')
    const locale = useLocale()
    const normalizedLocale: LocalesType = locale === 'vi' ? 'vi' : 'en'

    // State
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(20)
    const [searchTerm, setSearchTerm] = useState('')
    const [timePeriod, setTimePeriod] = useState<'24h' | '7d' | '30d' | 'all'>('7d')
    const [activityType, setActivityType] = useState('all')

    const dateFrom = useMemo(() => {
        if (timePeriod === 'all') return undefined

        const now = new Date()
        const offsetDays = timePeriod === '24h' ? 1 : timePeriod === '7d' ? 7 : 30
        now.setDate(now.getDate() - offsetDays)

        return DATE_FORMATTER.format(now)
    }, [timePeriod])

    // Fetch data
    const activityQuery = useGetActivityLogsQuery({
        page,
        per_page: perPage,
        log_type: type === 'system' ? 'activity' : 'admin',
        action_type: activityType !== 'all' ? activityType : undefined,
        date_from: dateFrom,
        order_by: ['-created_at']
    }) as unknown as {
        data?: ActivityLogsApiResponse
        isLoading: boolean
    }
    const { isLoading } = activityQuery
    const responseData = activityQuery.data as ActivityLogsApiResponse | undefined

    const logs: AdminActivityListItem[] = responseData?.data ?? []
    const pagination = responseData?.meta
    const filteredLogs = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase()
        if (!normalizedSearch) return logs

        return logs.filter((log: AdminActivityListItem) => {
            return [
                getActorName(log),
                log.resource_type,
                String(log.resource_id ?? ''),
                'action' in log ? log.action : log.action_type,
                'reason' in log ? (log.reason ?? '') : ''
            ]
                .join(' ')
                .toLowerCase()
                .includes(normalizedSearch)
        })
    }, [logs, searchTerm])
    const totalItems = pagination?.total ?? filteredLogs.length

    // Handlers
    const handleSearch = (value: string) => {
        setSearchTerm(value)
        setPage(1)
    }

    const handlePerPageChange = (value: string) => {
        setPerPage(Number(value))
        setPage(1)
    }

    const getActivityColor = (activityKey: string): string => {
        const colorMap: Record<string, string> = {
            // User actions
            user_registered: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            user_login: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            user_logout: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',

            // Post actions
            post_created: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            post_deleted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            post_liked: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
            post_unliked: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',

            // Comment actions
            comment_created: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
            comment_deleted: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',

            // Admin actions
            admin_ban_user: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            admin_unban_user: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        }
        return colorMap[activityKey] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }

    const getActivityIcon = (activityKey: string): string => {
        const iconMap: Record<string, string> = {
            // User
            user_registered: '👤',
            user_login: '🔓',
            user_logout: '🔒',

            // Post
            post_created: '📝',
            post_deleted: '🗑️',
            post_liked: '❤️',
            post_unliked: '💔',

            // Comment
            comment_created: '💬',
            comment_deleted: '❌',

            // Admin
            admin_ban_user: '⛔',
            admin_unban_user: '✅'
        }
        return iconMap[activityKey] || '📋'
    }

    const getActivityKey = (log: { action?: string; action_type?: string }): string => {
        return log.action ?? log.action_type ?? 'unknown'
    }

    const getActorName = (log: {
        admin?: { username: string } | undefined
        user?: { username: string } | undefined
    }) => {
        return log.admin?.username ?? log.user?.username
    }

    const getActivityMetadata = (log: AdminActivityListItem) => {
        return 'metadata' in log ? log.metadata : null
    }

    // Render loading skeleton
    if (isLoading) {
        return (
            <div className='space-y-4'>
                <div className='flex gap-2'>
                    <Skeleton className='h-10 flex-1' />
                    <Skeleton className='h-10 w-32' />
                </div>
                <div className='space-y-3'>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className='h-24' />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className='space-y-4'>
            {/* Header - Search and Filters */}
            <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
                <div className='flex-1 relative'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                    <Input
                        placeholder={t('activity.placeholders.searchActivity')}
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className='pl-10'
                    />
                </div>

                <div className='flex gap-2'>
                    {/* Time Period Filter */}
                    <Select
                        value={timePeriod}
                        onValueChange={(v: '24h' | '7d' | '30d' | 'all') => {
                            setTimePeriod(v)
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className='w-40'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='24h'>{t('activity.periods.last24h')}</SelectItem>
                            <SelectItem value='7d'>{t('activity.periods.last7d')}</SelectItem>
                            <SelectItem value='30d'>{t('activity.periods.last30d')}</SelectItem>
                            <SelectItem value='all'>{t('activity.periods.allTime')}</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Activity Type Filter */}
                    <Select
                        value={activityType}
                        onValueChange={(v) => {
                            setActivityType(v)
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className='w-40'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>{t('activity.filters.allTypes')}</SelectItem>
                            {ACTIVITY_TYPES.map((activity) => (
                                <SelectItem key={activity.value} value={activity.value}>
                                    {activity.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Timeline/List */}
            {filteredLogs.length === 0 ? (
                <div className='border rounded-lg p-8 text-center'>
                    <AlertCircle className='w-12 h-12 text-muted-foreground mx-auto mb-3' />
                    <p className='text-muted-foreground'>{t('activity.emptyState')}</p>
                </div>
            ) : (
                <div className='space-y-3'>
                    {filteredLogs.map((log: AdminActivityListItem) => (
                        <div key={log.id} className='border rounded-lg p-4 hover:bg-muted/50 transition'>
                            <div className='flex gap-4'>
                                {/* Avatar/Icon */}
                                <div className='flex-shrink-0 text-2xl'>{getActivityIcon(getActivityKey(log))}</div>

                                {/* Content */}
                                <div className='flex-1 min-w-0'>
                                    <div className='flex flex-wrap items-center gap-2 mb-1'>
                                        <Badge variant='outline' className={getActivityColor(getActivityKey(log))}>
                                            {getActivityLabel(getActivityKey(log))}
                                        </Badge>
                                        <span className='text-sm text-muted-foreground'>
                                            {timeAgo({ locale: normalizedLocale, date: log.created_at })}
                                        </span>
                                    </div>

                                    {/* Activity Details */}
                                    <div className='text-sm'>
                                        {getActorName(log) && (
                                            <p className='text-foreground'>
                                                <span className='font-semibold'>{getActorName(log)}</span>
                                                {log.resource_type && (
                                                    <>
                                                        {' '}
                                                        {t('activity.prepositions.on')}{' '}
                                                        <span className='font-medium'>{log.resource_type}</span>
                                                    </>
                                                )}
                                            </p>
                                        )}

                                        {/* Metadata Display */}
                                        {getActivityMetadata(log) &&
                                            Object.keys(getActivityMetadata(log) || {}).length > 0 && (
                                                <div className='mt-2 space-y-1 text-muted-foreground'>
                                                    {Object.entries(getActivityMetadata(log) || {}).map(
                                                        ([key, value]) => (
                                                            <div key={key} className='text-xs'>
                                                                <span className='font-medium'>{key}:</span>{' '}
                                                                {typeof value === 'string'
                                                                    ? truncateText(value, 50)
                                                                    : JSON.stringify(value)}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                    </div>

                                    {/* Timestamp */}
                                    <div className='text-xs text-muted-foreground mt-2'>
                                        {formatAdminDate(log.created_at)}
                                    </div>
                                </div>

                                {/* Resource ID */}
                                {log.resource_id && (
                                    <div className='flex-shrink-0 text-right'>
                                        <div className='text-xs font-mono text-muted-foreground'>
                                            #{log.resource_id}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {pagination && (
                <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                    {/* Per Page Selector */}
                    <div className='flex items-center gap-2'>
                        <span className='text-sm text-muted-foreground'>{t('common.perPage')}</span>
                        <Select value={String(perPage)} onValueChange={handlePerPageChange}>
                            <SelectTrigger className='w-20'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='10'>10</SelectItem>
                                <SelectItem value='20'>20</SelectItem>
                                <SelectItem value='50'>50</SelectItem>
                                <SelectItem value='100'>100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Info */}
                    <div className='text-sm text-muted-foreground'>
                        {t('common.showingResults', {
                            from: (pagination.current_page - 1) * perPage + 1,
                            to: Math.min(pagination.current_page * perPage, totalItems),
                            total: totalItems
                        })}
                    </div>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <AutoPagination page={page} pageSize={pagination.last_page} onPageChange={setPage} />
                    )}
                </div>
            )}
        </div>
    )
}
