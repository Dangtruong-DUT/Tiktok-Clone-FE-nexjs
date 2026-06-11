'use client'

import { useState } from 'react'
import {
    Clock,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Pencil,
    CalendarClock,
    FileText,
    Send,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import type { OffsetPaginationMeta } from '@/types/common/pagination-meta.type'
import {
    useListStudioPostsQuery,
    useSchedulePostMutation,
    useReschedulePostMutation,
    usePublishNowMutation,
    useCancelScheduleMutation
} from '@/store/services/content/studio-post-schedule.service'
import { STUDIO_POST_STATUSES } from '@/constants/studio-post'
import { POST_STATUS_BADGE } from '@/constants/status/post'
import type { StudioPostStatus, StudioPostItem } from '@/types/models/studio-post.model'

type FilterKey = 'all' | 'draft' | 'scheduled' | 'published' | 'failed'

const STATUS_FILTER_MAP: Record<FilterKey, StudioPostStatus | undefined> = {
    all: undefined,
    draft: STUDIO_POST_STATUSES.DRAFT,
    scheduled: STUDIO_POST_STATUSES.SCHEDULED,
    published: STUDIO_POST_STATUSES.PUBLISHED,
    failed: STUDIO_POST_STATUSES.FAILED
}

function formatDateTime(iso: string): string {
    try {
        return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
    } catch {
        return iso.slice(0, 16).replace('T', ' ')
    }
}

const toDatetimeLocal = (iso: string) => iso.slice(0, 16)
const fromDatetimeLocal = (v: string) => new Date(v).toISOString()

function RescheduleInline({
    schedUuid,
    currentTime,
    timezone,
    onSaved,
    onCancel
}: {
    schedUuid: string
    currentTime: string
    timezone: string
    onSaved: () => void
    onCancel: () => void
}) {
    const t = useTranslations('SnapiStudio.scheduledPosts')
    const [value, setValue] = useState(toDatetimeLocal(currentTime))
    const [reschedule, { isLoading }] = useReschedulePostMutation()

    const handle = async () => {
        try {
            await reschedule({ schedUuid, scheduled_at: fromDatetimeLocal(value), timezone }).unwrap()
            toast.success(t('toast.updated'))
            onSaved()
        } catch {
            toast.error(t('toast.updateError'))
        }
    }

    return (
        <div className='flex items-center gap-2 mt-2 flex-wrap'>
            <input
                type='datetime-local'
                value={value}
                onChange={(e) => setValue(e.target.value)}
                min={toDatetimeLocal(new Date(Date.now() + 60_000).toISOString())}
                className='rounded-lg border border-border bg-background text-foreground
                           px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary/50'
            />
            <Button size='sm' className='h-7 text-xs gap-1' onClick={handle} disabled={isLoading}>
                {isLoading ? <RefreshCw size={11} className='animate-spin' /> : <CheckCircle2 size={11} />}
                {t('actions.confirm')}
            </Button>
            <Button size='sm' variant='ghost' className='h-7 text-xs' onClick={onCancel}>
                {t('actions.cancel')}
            </Button>
        </div>
    )
}

function ScheduleInline({
    postUuid,
    onSaved,
    onCancel
}: {
    postUuid: string
    onSaved: () => void
    onCancel: () => void
}) {
    const t = useTranslations('SnapiStudio.scheduledPosts')
    const minDate = toDatetimeLocal(new Date(Date.now() + 60_000).toISOString())
    const [value, setValue] = useState(minDate)
    const [schedule, { isLoading }] = useSchedulePostMutation()

    const handle = async () => {
        try {
            await schedule({
                postUuid,
                scheduled_at: fromDatetimeLocal(value),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }).unwrap()
            toast.success(t('toast.scheduled'))
            onSaved()
        } catch {
            toast.error(t('toast.scheduleError'))
        }
    }

    return (
        <div className='flex items-center gap-2 mt-2 flex-wrap'>
            <input
                type='datetime-local'
                value={value}
                min={minDate}
                onChange={(e) => setValue(e.target.value)}
                className='rounded-lg border border-border bg-background text-foreground
                           px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary/50'
            />
            <Button size='sm' className='h-7 text-xs gap-1' onClick={handle} disabled={isLoading}>
                {isLoading ? <RefreshCw size={11} className='animate-spin' /> : <CalendarClock size={11} />}
                {t('actions.schedule')}
            </Button>
            <Button size='sm' variant='ghost' className='h-7 text-xs' onClick={onCancel}>
                {t('actions.cancel')}
            </Button>
        </div>
    )
}

function PostCard({ post }: { post: StudioPostItem }) {
    const t = useTranslations('SnapiStudio.scheduledPosts')
    const [rescheduleOpen, setRescheduleOpen] = useState(false)
    const [scheduleOpen, setScheduleOpen] = useState(false)

    const [publishNow, { isLoading: isPublishing }] = usePublishNowMutation()
    const [cancelSched, { isLoading: isCancelling }] = useCancelScheduleMutation()

    const schedPost = post.scheduled_post
    const isPending = schedPost?.status === 'pending'
    const isFailed = post.status === 'failed'
    const isDraft = post.status === 'draft'
    const isPublished = post.status === 'published'

    return (
        <div className='rounded-xl border border-border bg-card p-4 space-y-2.5'>
            {/* Status row */}
            <div className='flex items-center justify-between gap-2 flex-wrap'>
                <span
                    className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        POST_STATUS_BADGE[post.status] ?? 'bg-muted text-muted-foreground'
                    )}
                >
                    {post.status_label}
                </span>
                {schedPost?.scheduled_at && !isPublished && (
                    <span className='text-xs text-muted-foreground flex items-center gap-1'>
                        <Clock size={11} />
                        {formatDateTime(schedPost.scheduled_at)}
                    </span>
                )}
                {isPublished && post.published_at && (
                    <span className='text-xs text-muted-foreground flex items-center gap-1'>
                        <CheckCircle2 size={11} className='text-green-500' />
                        {formatDateTime(post.published_at)}
                    </span>
                )}
            </div>

            {/* Content preview */}
            {post.content ? (
                <p className='text-sm leading-relaxed line-clamp-2 text-foreground'>{post.content}</p>
            ) : (
                <p className='text-sm italic text-muted-foreground'>{t('noContentPreview')}</p>
            )}

            {schedPost?.error_message && <p className='text-xs text-destructive'>{schedPost.error_message}</p>}

            {/* Action buttons */}
            <div className='flex flex-wrap gap-1.5 pt-0.5'>
                {isDraft && !scheduleOpen && (
                    <>
                        <Button
                            size='sm'
                            variant='outline'
                            className='h-7 text-xs gap-1'
                            onClick={() => setScheduleOpen(true)}
                        >
                            <CalendarClock size={11} />
                            {t('actions.schedule')}
                        </Button>
                        <Button
                            size='sm'
                            className='h-7 text-xs gap-1'
                            onClick={() => publishNow(post.uuid)}
                            disabled={isPublishing}
                        >
                            {isPublishing ? <RefreshCw size={11} className='animate-spin' /> : <Send size={11} />}
                            {t('actions.publishNow')}
                        </Button>
                    </>
                )}
                {isPending && !rescheduleOpen && (
                    <>
                        <Button
                            size='sm'
                            className='h-7 text-xs gap-1'
                            onClick={() => publishNow(post.uuid)}
                            disabled={isPublishing}
                        >
                            {isPublishing ? <RefreshCw size={11} className='animate-spin' /> : <Send size={11} />}
                            {t('actions.publishNow')}
                        </Button>
                        <Button
                            size='sm'
                            variant='outline'
                            className='h-7 text-xs gap-1'
                            onClick={() => setRescheduleOpen(true)}
                        >
                            <Pencil size={11} />
                            {t('actions.reschedule')}
                        </Button>
                        <Button
                            size='sm'
                            variant='ghost'
                            className='h-7 text-xs text-destructive gap-1'
                            onClick={() => schedPost && cancelSched(schedPost.uuid)}
                            disabled={isCancelling}
                        >
                            <XCircle size={11} />
                            {t('actions.cancelSchedule')}
                        </Button>
                    </>
                )}
                {isFailed && (
                    <Button
                        size='sm'
                        className='h-7 text-xs gap-1'
                        onClick={() => publishNow(post.uuid)}
                        disabled={isPublishing}
                    >
                        {isPublishing ? <RefreshCw size={11} className='animate-spin' /> : <RefreshCw size={11} />}
                        {t('actions.retry')}
                    </Button>
                )}
            </div>

            {rescheduleOpen && schedPost && (
                <RescheduleInline
                    schedUuid={schedPost.uuid}
                    currentTime={schedPost.scheduled_at}
                    timezone={schedPost.user_timezone}
                    onSaved={() => setRescheduleOpen(false)}
                    onCancel={() => setRescheduleOpen(false)}
                />
            )}
            {scheduleOpen && (
                <ScheduleInline
                    postUuid={post.uuid}
                    onSaved={() => setScheduleOpen(false)}
                    onCancel={() => setScheduleOpen(false)}
                />
            )}
        </div>
    )
}

export default function ScheduledPostsContent() {
    const t = useTranslations('SnapiStudio.scheduledPosts')
    const [filter, setFilter] = useState<FilterKey>('all')
    const [page, setPage] = useState(1)

    const FILTERS: { key: FilterKey; label: string; icon: React.ElementType }[] = [
        { key: 'all', label: t('filters.all'), icon: FileText },
        { key: 'draft', label: t('filters.draft'), icon: FileText },
        { key: 'scheduled', label: t('filters.scheduled'), icon: CalendarClock },
        { key: 'published', label: t('filters.published'), icon: CheckCircle2 },
        { key: 'failed', label: t('filters.failed'), icon: XCircle }
    ]

    const activeStatus = STATUS_FILTER_MAP[filter]

    const { data, isLoading, isFetching } = useListStudioPostsQuery(
        { status: activeStatus, page, per_page: 10 },
        { refetchOnMountOrArgChange: true }
    )

    const posts = (data?.data ?? []) as StudioPostItem[]
    const lastPage = (data?.meta as OffsetPaginationMeta | undefined)?.last_page ?? 1

    const handleFilterChange = (key: FilterKey) => {
        setFilter(key)
        setPage(1)
    }

    return (
        <div className='space-y-4'>
            {/* Filter chips */}
            <div className='flex gap-1.5 flex-wrap px-4 sm:px-6 pt-2'>
                {FILTERS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => handleFilterChange(key)}
                        className={cn(
                            'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                            filter === key
                                ? 'bg-primary text-primary-foreground'
                                : 'border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                        )}
                    >
                        <Icon size={11} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Post list */}
            <div className='px-4 sm:px-6'>
                {isLoading ? (
                    <div className='space-y-3'>
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className='h-28 rounded-xl' />
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className='flex flex-col items-center gap-2 py-16 text-center'>
                        <FileText size={36} className='text-muted-foreground/30' />
                        <p className='text-sm text-muted-foreground'>{t('noContent')}</p>
                    </div>
                ) : (
                    <div className={cn('space-y-3', isFetching && 'opacity-60 pointer-events-none')}>
                        {posts.map((post) => (
                            <PostCard key={post.uuid} post={post} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {lastPage > 1 && (
                    <div className='flex items-center justify-center gap-2 mt-4'>
                        <Button
                            size='sm'
                            variant='outline'
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1 || isFetching}
                        >
                            <ChevronLeft size={13} />
                        </Button>
                        <span className='text-xs text-muted-foreground tabular-nums'>
                            {page} / {lastPage}
                        </span>
                        <Button
                            size='sm'
                            variant='outline'
                            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                            disabled={page === lastPage || isFetching}
                        >
                            <ChevronRight size={13} />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
