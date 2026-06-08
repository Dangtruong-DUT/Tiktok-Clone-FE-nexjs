'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useGetActivityLogsQuery } from '@/store/services/admin'
import { Input } from '@/components/ui/input'
import { Search, X as XIcon } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AutoPagination from '@/components/data-display/auto-pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { AdminTimelineRow } from '@/components/admin'
import {
    getActivityKey,
    getActionIconConfig,
    getActivityActorName,
    formatActivityResourceRefStyled,
    truncateText
} from '@/utils/admin/admin.util'
import { formatDateTime, timeAgo } from '@/utils/formatting/format-time.util'
import type { LocalesType } from '@/i18n/config'
import { ACTIVITY_TYPES } from '@/constants/admin/ui'
import type { AdminActivityListItem } from '@/types/dtos/admin/admin-response.dto'
import type { OffsetPaginationMeta } from '@/types/common/pagination-meta.type'
import { ActivityLogDetailDialog } from './activity-log-detail-dialog'

interface ActivityLogProps {
    type?: 'all' | 'admin' | 'system'
}

type TimePeriod = '24h' | '7d' | '30d' | 'all'

const DATE_FORMATTER = new Intl.DateTimeFormat('en-CA')

function buildSentenceJSX(log: AdminActivityListItem, t: ReturnType<typeof useTranslations<'AdminPage'>>) {
    const actionKey = getActivityKey(log)
    const actor = getActivityActorName(log)
    const ref = formatActivityResourceRefStyled(log)
    const verbKey = `activitySentence.${actionKey}` as Parameters<typeof t>[0]
    const verb = t(verbKey)
    const actorLabel = actor ?? '—'
    return (
        <>
            <strong className='font-semibold text-foreground'>{actorLabel}</strong> {verb}
            {ref.text && (
                <>
                    {' '}
                    <span
                        className={
                            ref.isUserRef ? 'text-orange-400 font-mono text-xs' : 'text-orange-400 font-mono text-xs'
                        }
                    >
                        {ref.text}
                    </span>
                </>
            )}
        </>
    )
}

export function ActivityLog({ type = 'all' }: ActivityLogProps) {
    const t = useTranslations('AdminPage')
    const locale = useLocale()
    const normalizedLocale: LocalesType = locale === 'vi' ? 'vi' : 'en'

    const displayDateFormatter = useMemo(
        () => new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'full' }),
        [locale]
    )

    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(20)
    const [searchTerm, setSearchTerm] = useState('')
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('7d')
    const [activityType, setActivityType] = useState('all')
    const [detailLog, setDetailLog] = useState<AdminActivityListItem | null>(null)

    const dateFrom = useMemo(() => {
        if (timePeriod === 'all') return undefined
        const now = new Date()
        const offsetDays = timePeriod === '24h' ? 1 : timePeriod === '7d' ? 7 : 30
        now.setDate(now.getDate() - offsetDays)
        return DATE_FORMATTER.format(now)
    }, [timePeriod])

    const { data, isLoading } = useGetActivityLogsQuery({
        page,
        per_page: perPage,
        log_type: type === 'system' ? 'activity' : 'admin',
        action_type: activityType !== 'all' ? activityType : undefined,
        date_from: dateFrom,
        order_by: ['-created_at']
    })

    const logs: AdminActivityListItem[] = data?.data ?? []
    const pagination = data?.meta as OffsetPaginationMeta | undefined

    const filteredLogs = useMemo(() => {
        const needle = searchTerm.trim().toLowerCase()
        if (!needle) return logs
        return logs.filter((log) =>
            [
                getActivityActorName(log) ?? '',
                log.resource_type ?? '',
                String(log.resource_id ?? ''),
                'action' in log ? log.action : log.action_type,
                'reason' in log ? (log.reason ?? '') : ''
            ]
                .join(' ')
                .toLowerCase()
                .includes(needle)
        )
    }, [logs, searchTerm])

    const totalItems = pagination?.total ?? filteredLogs.length

    const groupedLogs = useMemo(() => {
        const groups = new Map<string, AdminActivityListItem[]>()
        filteredLogs.forEach((log) => {
            const dateKey = DATE_FORMATTER.format(new Date(log.created_at))
            if (!groups.has(dateKey)) groups.set(dateKey, [])
            groups.get(dateKey)!.push(log)
        })
        return Array.from(groups.entries()).map(([date, items]) => ({ date, items }))
    }, [filteredLogs])

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        setPage(1)
    }

    if (isLoading) {
        return (
            <div className='space-y-4'>
                <div className='flex gap-2'>
                    <Skeleton className='h-10 flex-1' />
                    <Skeleton className='h-10 w-32' />
                </div>
                <div className='space-y-2'>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className='h-14' />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className='space-y-6'>
            <div className='rounded-lg border border-border bg-card p-4 md:p-5'>
                <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
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
                        </div>
                    </div>

                    <div className='flex flex-wrap gap-2'>
                        <Select
                            value={timePeriod}
                            onValueChange={(v: TimePeriod) => {
                                setTimePeriod(v)
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className='filter-select w-40'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='24h'>{t('activity.periods.last24h')}</SelectItem>
                                <SelectItem value='7d'>{t('activity.periods.last7d')}</SelectItem>
                                <SelectItem value='30d'>{t('activity.periods.last30d')}</SelectItem>
                                <SelectItem value='all'>{t('activity.periods.allTime')}</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={activityType}
                            onValueChange={(v) => {
                                setActivityType(v)
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className='filter-select w-44'>
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

            {filteredLogs.length === 0 ? (
                <div className='rounded-lg border border-border bg-card p-10 text-center'>
                    <p className='text-muted-foreground'>{t('activity.emptyState')}</p>
                </div>
            ) : (
                <div className='space-y-6'>
                    {groupedLogs.map((group) => (
                        <section key={group.date} className='space-y-2'>
                            <div className='flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
                                <span>{displayDateFormatter.format(new Date(group.date))}</span>
                                <span className='h-px flex-1 bg-border' />
                                <span>{group.items.length}</span>
                            </div>

                            <div className='space-y-2'>
                                {group.items.map((log, idx) => {
                                    const actionKey = getActivityKey(log)
                                    const config = getActionIconConfig(actionKey)
                                    return (
                                        <AdminTimelineRow
                                            key={log.id}
                                            icon={config.icon}
                                            iconClassName={config.className}
                                            isLast={idx === group.items.length - 1}
                                            timeAgo={timeAgo({ locale: normalizedLocale, date: log.created_at })}
                                            timestamp={formatDateTime(log.created_at)}
                                            onClick={() => setDetailLog(log)}
                                        >
                                            {buildSentenceJSX(log, t)}
                                        </AdminTimelineRow>
                                    )
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            )}

            {pagination && (
                <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                    <div className='flex items-center gap-2'>
                        <span className='text-sm text-muted-foreground'>{t('common.perPage')}</span>
                        <Select
                            value={String(perPage)}
                            onValueChange={(v) => {
                                setPerPage(Number(v))
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className='filter-select w-20'>
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

                    <div className='text-sm text-muted-foreground'>
                        {t('common.showingResults', {
                            from: (pagination.current_page - 1) * perPage + 1,
                            to: Math.min(pagination.current_page * perPage, totalItems),
                            total: totalItems
                        })}
                    </div>

                    {pagination.last_page > 1 && (
                        <AutoPagination page={page} pageSize={pagination.last_page} onPageChange={setPage} />
                    )}
                </div>
            )}

            {detailLog && (
                <ActivityLogDetailDialog
                    open={detailLog !== null}
                    log={detailLog}
                    onOpenChange={(open) => !open && setDetailLog(null)}
                />
            )}
        </div>
    )
}
