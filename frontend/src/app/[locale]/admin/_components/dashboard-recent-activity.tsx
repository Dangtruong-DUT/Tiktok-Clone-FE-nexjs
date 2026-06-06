'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useGetActivityLogsQuery } from '@/store/services/admin'
import { AdminTimelineRow } from '@/components/admin'
import { Skeleton } from '@/components/ui/skeleton'
import { ADMIN_ROUTES } from '@/constants/routes/routes'
import {
    getActivityKey,
    getActionIconConfig,
    getActivityActorName,
    formatActivityResourceRefStyled
} from '@/utils/admin/admin.util'
import { timeAgo, formatDateTime } from '@/utils/formatting/format-time.util'
import type { LocalesType } from '@/i18n/config'
import type { AdminActivityListItem } from '@/types/dtos/admin/admin-response.dto'

const RECENT_LIMIT = 8

export function DashboardRecentActivity() {
    const t = useTranslations('AdminPage')
    const locale = useLocale()
    const normalizedLocale: LocalesType = locale === 'vi' ? 'vi' : 'en'

    const { data, isLoading } = useGetActivityLogsQuery({
        page: 1,
        per_page: RECENT_LIMIT,
        log_type: 'admin',
        order_by: ['-created_at']
    })

    const logs: AdminActivityListItem[] = data?.data ?? []

    function buildSentenceJSX(log: AdminActivityListItem) {
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
                        <span className='text-orange-400 font-mono text-xs'>{ref.text}</span>
                    </>
                )}
            </>
        )
    }

    if (isLoading) {
        return (
            <div className='space-y-2'>
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className='h-14' />
                ))}
            </div>
        )
    }

    return (
        <div>
            <div className='mb-3 flex items-center justify-between'>
                <h2 className='text-sm font-semibold text-foreground'>{t('dashboard.recentAdminActivity')}</h2>
                <Link
                    href={ADMIN_ROUTES.ACTIVITY}
                    className='text-xs font-medium text-orange-400 hover:text-orange-300 transition-colors'
                >
                    {t('dashboard.viewAll')}
                </Link>
            </div>

            {logs.length === 0 ? (
                <p className='text-sm text-muted-foreground'>{t('activity.emptyState')}</p>
            ) : (
                <div className='space-y-2'>
                    {logs.map((log, idx) => {
                        const actionKey = getActivityKey(log)
                        const config = getActionIconConfig(actionKey)
                        return (
                            <AdminTimelineRow
                                key={log.id}
                                icon={config.icon}
                                iconClassName={config.className}
                                isLast={idx === logs.length - 1}
                                timeAgo={timeAgo({ locale: normalizedLocale, date: log.created_at })}
                                timestamp={formatDateTime(log.created_at)}
                            >
                                {buildSentenceJSX(log)}
                            </AdminTimelineRow>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
