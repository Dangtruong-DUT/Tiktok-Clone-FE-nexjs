'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useGetActivityLogsQuery } from '@/store/services/admin/index'
import { Input } from '@/components/ui/input'
import { Search, X as XIcon } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AutoPagination from '@/components/auto-pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatAdminDate, getActivityKey, truncateText } from '@/helpers/admin-helpers'
import { timeAgo } from '@/utils/formatting/formatTime.util'
import type { LocalesType } from '@/i18n/config'
import { ACTIVITY_TYPES } from '@/constants/ui/admin'
import { AdminActivityListItem } from '@/types/dtos/admin/admin-response.dto'
import { ActivityLogDetailDialog } from './activity-log-detail-dialog'
import { Button } from '@/components/ui/button'

interface ActivityLogProps {
    type?: 'all' | 'admin' | 'system'
}

const DATE_FORMATTER = new Intl.DateTimeFormat('en-CA')

export function ActivityLog({ type = 'all' }: ActivityLogProps) {
    const t = useTranslations('AdminPage')
    const locale = useLocale()
    const normalizedLocale: LocalesType = locale === 'vi' ? 'vi' : 'en'
    const displayDateFormatter = useMemo(() => {
        return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
            dateStyle: 'full'
        })
    }, [locale])

    // State
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(20)
    const [searchTerm, setSearchTerm] = useState('')
    const [timePeriod, setTimePeriod] = useState<'24h' | '7d' | '30d' | 'all'>('7d')
    const [activityType, setActivityType] = useState('all')
    const [detailLog, setDetailLog] = useState<AdminActivityListItem | null>(null)

    const dateFrom = useMemo(() => {
        if (timePeriod === 'all') return undefined

        const now = new Date()
        const offsetDays = timePeriod === '24h' ? 1 : timePeriod === '7d' ? 7 : 30
        now.setDate(now.getDate() - offsetDays)

        return DATE_FORMATTER.format(now)
    }, [timePeriod])

    // Fetch data
    const { data, isLoading } = useGetActivityLogsQuery({
        page,
        per_page: perPage,
        log_type: type === 'system' ? 'activity' : 'admin',
        action_type: activityType !== 'all' ? activityType : undefined,
        date_from: dateFrom,
        order_by: ['-created_at']
    })

    const logs: AdminActivityListItem[] = data?.data ?? []
    const pagination = data?.meta
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
    const groupedLogs = useMemo(() => {
        const groups = new Map<string, AdminActivityListItem[]>()
        filteredLogs.forEach((log) => {
            const dateKey = DATE_FORMATTER.format(new Date(log.created_at))
            if (!groups.has(dateKey)) {
                groups.set(dateKey, [])
            }
            groups.get(dateKey)?.push(log)
        })

        return Array.from(groups.entries()).map(([date, items]) => ({ date, items }))
    }, [filteredLogs])

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
            // System/user activity
            user_registered: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            user_login: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            user_logout: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
            post_created: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            post_deleted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            post_liked: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
            post_unliked: 'bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
            comment_created: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
            comment_deleted: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            // Admin punitive actions (red spectrum)
            ban: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            delete_user: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            delete_post: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            delete_comment: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            reject_appeal: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            // Admin positive actions (green spectrum)
            unban: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
            restore_user: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
            restore_post: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
            restore_comment: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
            approve_appeal: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
            // Neutral admin actions
            reset_user_password: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            send_email_to_user: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            update: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }
        return colorMap[activityKey] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
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

    const getMetadataEntries = (log: AdminActivityListItem) => {
        const metadata = getActivityMetadata(log)
        if (!metadata) return []

        return Object.entries(metadata)
            .filter(([key, value]) => key && value !== undefined && value !== null)
            .slice(0, 4)
    }

    const formatMetadataValue = (value: unknown): string => {
        if (typeof value === 'string') return truncateText(value, 80)
        if (typeof value === 'number' || typeof value === 'boolean') return String(value)
        return truncateText(JSON.stringify(value), 80)
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
        <div className='space-y-6'>
            {/* Header - Search and Filters */}
            <div className='rounded-xl border bg-background p-4 md:p-5'>
                <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
                    <div className='flex-1 space-y-3'>
                        <div className='relative'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                            <Input
                                placeholder={t('activity.placeholders.searchActivity')}
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className='pl-9'
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => handleSearch('')}
                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                                >
                                    <XIcon className='h-3.5 w-3.5' />
                                </button>
                            )}
                        </div>

                        <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                            <span>
                                {t('common.showingResults', {
                                    from:
                                        totalItems === 0
                                            ? 0
                                            : pagination?.current_page
                                              ? (pagination.current_page - 1) * perPage + 1
                                              : 1,
                                    to: pagination?.current_page
                                        ? Math.min(pagination.current_page * perPage, totalItems)
                                        : totalItems,
                                    total: totalItems
                                })}
                            </span>
                            {searchTerm.trim() && (
                                <Badge variant='secondary' className='text-xs'>
                                    {truncateText(searchTerm.trim(), 24)}
                                </Badge>
                            )}
                            {activityType !== 'all' && (
                                <Badge variant='secondary' className='text-xs'>
                                    {ACTIVITY_TYPES.find((item) => item.value === activityType)?.label}
                                </Badge>
                            )}
                            {timePeriod !== 'all' && (
                                <Badge variant='secondary' className='text-xs'>
                                    {timePeriod === '24h'
                                        ? t('activity.periods.last24h')
                                        : timePeriod === '7d'
                                          ? t('activity.periods.last7d')
                                          : t('activity.periods.last30d')}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className='flex flex-wrap gap-2'>
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
                            <SelectTrigger className='w-44'>
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
            </div>

            {/* Timeline/List */}
            {filteredLogs.length === 0 ? (
                <div className='rounded-xl border bg-background p-10 text-center'>
                    <p className='text-muted-foreground'>{t('activity.emptyState')}</p>
                </div>
            ) : (
                <div className='space-y-6'>
                    {groupedLogs.map((group) => (
                        <section key={group.date} className='space-y-3'>
                            <div className='flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
                                <span>{displayDateFormatter.format(new Date(group.date))}</span>
                                <span className='h-px flex-1 bg-border' />
                                <span>{group.items.length}</span>
                            </div>

                            <div className='space-y-3'>
                                {group.items.map((log) => {
                                    const metadataEntries = getMetadataEntries(log)

                                    return (
                                        <div
                                            key={log.id}
                                            className='group rounded-lg border bg-background p-4 shadow-sm transition hover:border-muted-foreground/30'
                                        >
                                            <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
                                                <div className='flex min-w-0 flex-1 gap-3'>
                                                    <div className='min-w-0 space-y-2'>
                                                        <div className='flex flex-wrap items-center gap-2'>
                                                            <Badge
                                                                variant='outline'
                                                                className={getActivityColor(getActivityKey(log))}
                                                            >
                                                                {t(`actionLabels.${getActivityKey(log)}` as Parameters<typeof t>[0]) ?? getActivityKey(log)}
                                                            </Badge>
                                                            <span className='text-xs text-muted-foreground'>
                                                                {timeAgo({
                                                                    locale: normalizedLocale,
                                                                    date: log.created_at
                                                                })}
                                                            </span>
                                                            {log.resource_type && (
                                                                <Badge variant='secondary' className='text-xs'>
                                                                    {log.resource_type}
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div className='text-sm text-foreground'>
                                                            {getActorName(log) && (
                                                                <p>
                                                                    <span className='font-semibold'>
                                                                        {getActorName(log)}
                                                                    </span>
                                                                    {log.resource_type && (
                                                                        <>
                                                                            {' '}
                                                                            {t('activity.prepositions.on')}{' '}
                                                                            <span className='font-medium'>
                                                                                {log.resource_type}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {metadataEntries.length > 0 && (
                                                            <div className='grid grid-cols-1 gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2'>
                                                                {metadataEntries.map(([key, value]) => (
                                                                    <div key={key} className='flex gap-2'>
                                                                        <span className='font-medium'>{key}:</span>
                                                                        <span className='truncate'>
                                                                            {formatMetadataValue(value)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className='flex shrink-0 flex-row items-center gap-3 text-xs text-muted-foreground md:flex-col md:items-end'>
                                                    {log.resource_id && (
                                                        <span className='font-mono'>#{log.resource_id}</span>
                                                    )}
                                                    <span>{formatAdminDate(log.created_at)}</span>
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        className='h-7 px-2 text-xs'
                                                        onClick={() => setDetailLog(log)}
                                                    >
                                                        {t('activity.actions.viewDetails')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
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

            {detailLog && (
                <ActivityLogDetailDialog
                    open={!!detailLog}
                    log={detailLog}
                    onOpenChange={(open) => !open && setDetailLog(null)}
                />
            )}
        </div>
    )
}
