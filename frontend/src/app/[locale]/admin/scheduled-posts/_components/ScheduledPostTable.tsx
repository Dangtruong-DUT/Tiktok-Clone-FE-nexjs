'use client'

import { useState } from 'react'
import { Clock, XCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    useListScheduledPostsQuery,
    useAdminCancelScheduleMutation,
    useAdminRetryScheduleMutation,
} from '@/store/services/admin/admin-scheduled-posts.service'
import type { ScheduledPostStatus } from '@/types/models/scheduled-post.model'


const STATUS_STYLES: Record<ScheduledPostStatus, string> = {
    pending:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
    published:  'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
    failed:     'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
    cancelled:  'bg-muted text-muted-foreground',
}

const STATUS_OPTIONS = [
    { value: '',          label: 'Tất cả trạng thái' },
    { value: 'pending',   label: 'Pending' },
    { value: 'published', label: 'Published' },
    { value: 'failed',    label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
]

const SOURCE_OPTIONS = [
    { value: '',         label: 'Tất cả nguồn' },
    { value: 'manual',   label: 'Manual' },
    { value: 'calendar', label: 'Calendar' },
]


export function ScheduledPostTable() {
    const [status,   setStatus]   = useState('')
    const [source,   setSource]   = useState('')
    const [userUuid, setUserUuid] = useState('')
    const [page,     setPage]     = useState(1)

    const { data, isLoading, isFetching } = useListScheduledPostsQuery({
        status:    status    || undefined,
        source:    source    || undefined,
        user_uuid: userUuid  || undefined,
        page,
        per_page: 20,
    })

    const [cancelSchedule, { isLoading: isCancelling }] = useAdminCancelScheduleMutation()
    const [retrySchedule,  { isLoading: isRetrying }]   = useAdminRetryScheduleMutation()

    const items    = data?.data   ?? []
    const meta     = (data as any)?.meta
    const lastPage = meta?.last_page ?? 1

    const handleCancel = async (uuid: string) => {
        await cancelSchedule(uuid).unwrap()
        toast.success('Schedule đã bị hủy bởi admin.')
    }

    const handleRetry = async (uuid: string) => {
        await retrySchedule(uuid).unwrap()
        toast.success('Schedule đã được đưa vào hàng chờ lại.')
    }

    return (
        <div className='space-y-4'>
            {/* Filters */}
            <div className='flex flex-wrap gap-3'>
                <select
                    value={status}
                    onChange={e => { setStatus(e.target.value); setPage(1) }}
                    className='rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary/50'
                >
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>

                <select
                    value={source}
                    onChange={e => { setSource(e.target.value); setPage(1) }}
                    className='rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary/50'
                >
                    {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>

                <input
                    type='text'
                    value={userUuid}
                    onChange={e => { setUserUuid(e.target.value); setPage(1) }}
                    placeholder='User UUID...'
                    className='rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary/50 w-64'
                />
            </div>

            {/* Table */}
            {isLoading ? (
                <div className='space-y-2'>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className='h-16 w-full rounded-xl' />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className='flex flex-col items-center gap-2 py-12 text-center'>
                    <Clock size={36} className='text-muted-foreground/30' />
                    <p className='text-sm text-muted-foreground'>Không có kết quả nào.</p>
                </div>
            ) : (
                <div className={cn('space-y-2 transition-opacity', isFetching && 'opacity-60')}>
                    {items.map(item => (
                        <div key={item.uuid} className='rounded-xl border border-border bg-card p-4'>
                            <div className='flex items-start justify-between gap-4'>
                                <div className='flex-1 min-w-0 space-y-1'>
                                    {/* Status + source */}
                                    <div className='flex items-center gap-2 flex-wrap'>
                                        <span className={cn(
                                            'text-xs px-2 py-0.5 rounded-full font-medium',
                                            STATUS_STYLES[item.status]
                                        )}>
                                            {item.status_label}
                                        </span>
                                        <Badge variant='secondary' className='text-xs'>
                                            {item.source}
                                        </Badge>
                                    </div>

                                    {/* User */}
                                    {(item as any).user && (
                                        <p className='text-xs text-muted-foreground'>
                                            <span className='font-medium text-foreground'>{(item as any).user.name}</span>
                                            {' '}@{(item as any).user.username}
                                        </p>
                                    )}

                                    {/* Post preview */}
                                    {item.post?.content && (
                                        <p className='text-sm text-foreground/80 line-clamp-1'>{item.post.content}</p>
                                    )}

                                    {/* Time info */}
                                    <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                                        <span>
                                            <span className='font-medium'>Scheduled:</span>{' '}
                                            {item.scheduled_at.replace('T', ' ').slice(0, 16)} ({item.user_timezone})
                                        </span>
                                        {item.published_at && (
                                            <span>
                                                <span className='font-medium'>Published:</span>{' '}
                                                {item.published_at.replace('T', ' ').slice(0, 16)}
                                            </span>
                                        )}
                                    </div>

                                    {item.error_message && (
                                        <p className='text-xs text-destructive'>{item.error_message}</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className='flex gap-1.5 shrink-0'>
                                    {(item.status === 'pending' || item.status === 'processing') && (
                                        <Button
                                            size='sm'
                                            variant='ghost'
                                            className='h-7 text-xs text-destructive gap-1'
                                            onClick={() => handleCancel(item.uuid)}
                                            disabled={isCancelling}
                                        >
                                            <XCircle size={12} />
                                            Hủy
                                        </Button>
                                    )}
                                    {item.status === 'failed' && (
                                        <Button
                                            size='sm'
                                            variant='outline'
                                            className='h-7 text-xs gap-1'
                                            onClick={() => handleRetry(item.uuid)}
                                            disabled={isRetrying}
                                        >
                                            <RefreshCw size={12} />
                                            Retry
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {lastPage > 1 && (
                <div className='flex items-center justify-center gap-2'>
                    <Button
                        size='sm' variant='outline'
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft size={14} />
                    </Button>
                    <span className='text-sm text-muted-foreground'>
                        {page} / {lastPage}
                    </span>
                    <Button
                        size='sm' variant='outline'
                        onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                        disabled={page === lastPage}
                    >
                        <ChevronRight size={14} />
                    </Button>
                </div>
            )}
        </div>
    )
}
