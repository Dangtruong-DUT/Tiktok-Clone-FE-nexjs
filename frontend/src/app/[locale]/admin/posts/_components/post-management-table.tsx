'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { RefreshCw, XCircle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/empty-state'
import { TablePagination } from '@/components/data-display/table-pagination'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    useListScheduledPostsQuery,
    useAdminCancelScheduleMutation,
    useAdminRetryScheduleMutation
} from '@/store/services/admin/admin-scheduled-posts.service'
import { SCHEDULED_POST_STATUSES } from '@/constants/studio-post'
import { POST_STATUS_BADGE } from '@/constants/status/post'

const SCHEDULED_STATUS_BADGE: Record<string, string> = {
    pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    processing: 'bg-amber-100 text-amber-700 dark:bg-amber-800/40 dark:text-amber-300',
    published: POST_STATUS_BADGE['published'] ?? 'bg-emerald-100 text-emerald-800',
    failed: POST_STATUS_BADGE['failed'] ?? 'bg-red-100 text-red-800',
    cancelled: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
}

type StatusFilter = 'all' | 'pending' | 'processing' | 'published' | 'failed' | 'cancelled'

export function PostManagementTable() {
    const t = useTranslations('AdminPage')
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const perPage = 10

    const { data, isLoading, isFetching } = useListScheduledPostsQuery({
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
        per_page: perPage
    })

    const [cancelSchedule, { isLoading: isCancelling }] = useAdminCancelScheduleMutation()
    const [retrySchedule, { isLoading: isRetrying }] = useAdminRetryScheduleMutation()

    const items = data?.data ?? []
    const pagination = data?.meta
    const offsetPagination = pagination?.type === 'offset' ? pagination : undefined

    const handleCancel = async (uuid: string) => {
        try {
            await cancelSchedule(uuid).unwrap()
            toast.success(t('scheduledPosts.table.toast.cancelled'))
        } catch {
            toast.error(t('scheduledPosts.table.toast.cancelError'))
        }
    }

    const handleRetry = async (uuid: string) => {
        try {
            await retrySchedule(uuid).unwrap()
            toast.success(t('scheduledPosts.table.toast.retried'))
        } catch {
            toast.error(t('scheduledPosts.table.toast.retryError'))
        }
    }

    return (
        <div className='space-y-3'>
            <div className='flex items-center gap-2'>
                <Select
                    value={statusFilter}
                    onValueChange={(v) => {
                        setStatusFilter(v as StatusFilter)
                        setPage(1)
                    }}
                >
                    <SelectTrigger className='h-8 w-36 text-xs'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all' className='text-xs'>
                            {t('scheduledPosts.table.filters.allStatuses')}
                        </SelectItem>
                        <SelectItem value={SCHEDULED_POST_STATUSES.PENDING} className='text-xs'>
                            {t('scheduledPosts.table.filters.pending')}
                        </SelectItem>
                        <SelectItem value={SCHEDULED_POST_STATUSES.PROCESSING} className='text-xs'>
                            {t('scheduledPosts.table.filters.processing')}
                        </SelectItem>
                        <SelectItem value={SCHEDULED_POST_STATUSES.PUBLISHED} className='text-xs'>
                            {t('scheduledPosts.table.filters.published')}
                        </SelectItem>
                        <SelectItem value={SCHEDULED_POST_STATUSES.FAILED} className='text-xs'>
                            {t('scheduledPosts.table.filters.failed')}
                        </SelectItem>
                        <SelectItem value={SCHEDULED_POST_STATUSES.CANCELLED} className='text-xs'>
                            {t('scheduledPosts.table.filters.cancelled')}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className='space-y-2'>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className='h-14 rounded-lg' />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <EmptyState message={t('scheduledPosts.table.noResults')} />
            ) : (
                <div className={cn('space-y-2', isFetching && 'opacity-60 pointer-events-none')}>
                    {items.map((item) => (
                        <div key={item.uuid} className='rounded-lg border bg-card px-4 py-3 flex items-start gap-3'>
                            <div className='flex-1 min-w-0 space-y-1'>
                                <div className='flex items-center gap-2 flex-wrap'>
                                    <Badge
                                        variant='outline'
                                        className={cn(
                                            'text-xs border-transparent font-medium',
                                            SCHEDULED_STATUS_BADGE[item.status] ?? 'bg-muted text-muted-foreground'
                                        )}
                                    >
                                        {item.status_label ?? item.status}
                                    </Badge>
                                    {item.user && (
                                        <span className='text-xs text-muted-foreground'>@{item.user.username}</span>
                                    )}
                                    <div className='ml-auto flex flex-col items-end gap-0.5'>
                                        <span className='text-xs text-muted-foreground tabular-nums'>
                                            {t('scheduledPosts.table.labels.scheduled')}: {item.scheduled_at.slice(0, 16).replace('T', ' ')}
                                        </span>
                                        {item.published_at && (
                                            <span className='text-xs text-emerald-600 dark:text-emerald-400 tabular-nums'>
                                                {t('scheduledPosts.table.labels.published')}: {item.published_at.slice(0, 16).replace('T', ' ')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {item.post?.content && (
                                    <p className='text-xs text-muted-foreground line-clamp-1'>{item.post.content}</p>
                                )}
                                {item.error_message && <p className='text-xs text-destructive'>{item.error_message}</p>}
                            </div>

                            <div className='flex shrink-0 items-center gap-1.5'>
                                {item.status === SCHEDULED_POST_STATUSES.PENDING && (
                                    <Button
                                        size='sm'
                                        variant='ghost'
                                        className='h-7 text-xs text-destructive gap-1 hover:text-destructive hover:bg-destructive/10'
                                        onClick={() => handleCancel(item.uuid)}
                                        disabled={isCancelling}
                                    >
                                        <XCircle className='size-3.5' />
                                        {t('scheduledPosts.table.actions.cancel')}
                                    </Button>
                                )}
                                {item.status === SCHEDULED_POST_STATUSES.FAILED && (
                                    <Button
                                        size='sm'
                                        variant='ghost'
                                        className='h-7 text-xs gap-1'
                                        onClick={() => handleRetry(item.uuid)}
                                        disabled={isRetrying}
                                    >
                                        <RefreshCw className={cn('size-3.5', isRetrying && 'animate-spin')} />
                                        {t('scheduledPosts.table.actions.retry')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {offsetPagination && offsetPagination.last_page > 1 && (
                <TablePagination
                    pagination={offsetPagination}
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={() => {}}
                    perPageLabel={t('common.perPage')}
                    showingResultsFormatter={(from, to, total) => t('common.showingResults', { from, to, total })}
                />
            )}
        </div>
    )
}
