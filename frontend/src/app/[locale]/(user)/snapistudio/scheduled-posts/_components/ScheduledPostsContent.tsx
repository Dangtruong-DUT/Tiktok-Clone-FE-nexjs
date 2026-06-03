'use client'

import { useState } from 'react'
import {
    Clock, CheckCircle2, XCircle, AlertCircle,
    RefreshCw, Pencil, CalendarClock, FileText,
    Send, ChevronLeft, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import {
    useListStudioPostsQuery,
    useSchedulePostMutation,
    useReschedulePostMutation,
    usePublishNowMutation,
    useCancelScheduleMutation
} from '@/store/services/studio-post-schedule.service'
import { STUDIO_POST_STATUSES } from '@/constants/studio-post'
import type { StudioPostStatus, StudioPostItem } from '@/types/models/studio-post.model'

type TabKey = 'draft' | 'scheduled' | 'published' | 'failed'

function formatDateTime(iso: string): string {
    try {
        return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
    } catch {
        return iso.slice(0, 16).replace('T', ' ')
    }
}

const toDatetimeLocal = (iso: string) => iso.slice(0, 16)
const fromDatetimeLocal = (v: string) => new Date(v).toISOString()

function RescheduleInline({
    schedUuid, currentTime, timezone, onSaved, onCancel
}: {
    schedUuid: string; currentTime: string; timezone: string
    onSaved: () => void; onCancel: () => void
}) {
    const t = useTranslations('SnapiStudio.scheduledPosts')
    const [value, setValue] = useState(toDatetimeLocal(currentTime))
    const [reschedule, { isLoading }] = useReschedulePostMutation()

    const handleSave = async () => {
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
                type='datetime-local' value={value}
                onChange={e => setValue(e.target.value)}
                min={toDatetimeLocal(new Date().toISOString())}
                className='rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary/50'
            />
            <Button size='sm' className='h-7 text-xs gap-1' onClick={handleSave} disabled={isLoading}>
                {isLoading ? <RefreshCw size={11} className='animate-spin' /> : <CheckCircle2 size={11} />}
                {t('actions.confirm')}
            </Button>
            <Button size='sm' variant='ghost' className='h-7 text-xs' onClick={onCancel}>
                {t('actions.cancel')}
            </Button>
        </div>
    )
}

function ScheduleDialogInline({
    postUuid, onSaved, onCancel
}: {
    postUuid: string; onSaved: () => void; onCancel: () => void
}) {
    const t = useTranslations('SnapiStudio.scheduledPosts')
    const minDate = toDatetimeLocal(new Date(Date.now() + 60_000).toISOString())
    const [value, setValue] = useState(minDate)
    const [schedule, { isLoading }] = useSchedulePostMutation()

    const handleSchedule = async () => {
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
                type='datetime-local' value={value} min={minDate}
                onChange={e => setValue(e.target.value)}
                className='rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary/50'
            />
            <Button size='sm' className='h-7 text-xs gap-1' onClick={handleSchedule} disabled={isLoading}>
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
    const isPending   = schedPost?.status === 'pending'
    const isFailed    = post.status === 'failed'
    const isDraft     = post.status === 'draft'
    const isPublished = post.status === 'published'

    const handlePublishNow = async () => {
        await publishNow(post.uuid).unwrap()
        toast.success(t('toast.published'))
    }

    const handleCancel = async () => {
        if (!schedPost) return
        await cancelSched(schedPost.uuid).unwrap()
        toast.success(t('toast.cancelled'))
    }

    return (
        <div className='rounded-xl border border-border bg-card p-4 space-y-2.5'>
            <div className='flex items-center justify-between gap-2'>
                <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    post.status === 'draft'     && 'bg-muted text-muted-foreground',
                    post.status === 'scheduled' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400',
                    post.status === 'published' && 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
                    post.status === 'failed'    && 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                )}>
                    {post.status_label}
                </span>
                {schedPost?.scheduled_at && (
                    <span className='text-xs text-muted-foreground flex items-center gap-1'>
                        <Clock size={11} />{formatDateTime(schedPost.scheduled_at)}
                    </span>
                )}
                {isPublished && post.published_at && (
                    <span className='text-xs text-muted-foreground flex items-center gap-1'>
                        <CheckCircle2 size={11} className='text-green-500' />{formatDateTime(post.published_at)}
                    </span>
                )}
            </div>

            {post.content
                ? <p className='text-sm leading-relaxed line-clamp-2 text-foreground/90'>{post.content}</p>
                : <p className='text-sm italic text-muted-foreground'>{t('noContentPreview')}</p>
            }

            {schedPost?.error_message && <p className='text-xs text-destructive'>{schedPost.error_message}</p>}

            <div className='flex flex-wrap gap-1.5 pt-1'>
                {isDraft && !scheduleOpen && (
                    <>
                        <Button size='sm' variant='outline' className='h-7 text-xs gap-1' onClick={() => setScheduleOpen(true)}>
                            <CalendarClock size={11} />{t('actions.schedule')}
                        </Button>
                        <Button size='sm' className='h-7 text-xs gap-1' onClick={handlePublishNow} disabled={isPublishing}>
                            {isPublishing ? <RefreshCw size={11} className='animate-spin' /> : <Send size={11} />}
                            {t('actions.publishNow')}
                        </Button>
                    </>
                )}
                {isPending && !rescheduleOpen && (
                    <>
                        <Button size='sm' className='h-7 text-xs gap-1' onClick={handlePublishNow} disabled={isPublishing}>
                            {isPublishing ? <RefreshCw size={11} className='animate-spin' /> : <Send size={11} />}
                            {t('actions.publishNow')}
                        </Button>
                        <Button size='sm' variant='outline' className='h-7 text-xs gap-1' onClick={() => setRescheduleOpen(true)}>
                            <Pencil size={11} />{t('actions.reschedule')}
                        </Button>
                        <Button size='sm' variant='ghost' className='h-7 text-xs text-destructive gap-1' onClick={handleCancel} disabled={isCancelling}>
                            <XCircle size={11} />{t('actions.cancelSchedule')}
                        </Button>
                    </>
                )}
                {isFailed && (
                    <Button size='sm' className='h-7 text-xs gap-1' onClick={handlePublishNow} disabled={isPublishing}>
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
                <ScheduleDialogInline
                    postUuid={post.uuid}
                    onSaved={() => setScheduleOpen(false)}
                    onCancel={() => setScheduleOpen(false)}
                />
            )}
        </div>
    )
}

function TabContent({ status }: { status: StudioPostStatus }) {
    const t = useTranslations('SnapiStudio.scheduledPosts')
    const [page, setPage] = useState(1)

    const { data, isLoading, isFetching } = useListStudioPostsQuery(
        { status, page, per_page: 10 },
        { refetchOnMountOrArgChange: true }
    )

    const posts   = data?.data ?? []
    const meta    = (data as any)?.meta
    const lastPage = meta?.last_page ?? 1

    if (isLoading) return (
        <div className='space-y-3'>
            {[1, 2, 3].map(i => <Skeleton key={i} className='h-28 rounded-xl' />)}
        </div>
    )

    if (posts.length === 0) return (
        <div className='flex flex-col items-center gap-2 py-16 text-center'>
            <FileText size={36} className='text-muted-foreground/30' />
            <p className='text-sm text-muted-foreground'>{t('noContent')}</p>
        </div>
    )

    return (
        <div className='space-y-4'>
            <div className={cn('space-y-3', isFetching && 'opacity-60')}>
                {posts.map(post => <PostCard key={post.uuid} post={post} />)}
            </div>
            {lastPage > 1 && (
                <div className='flex items-center justify-center gap-2'>
                    <Button size='sm' variant='outline' onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                        <ChevronLeft size={13} />
                    </Button>
                    <span className='text-xs text-muted-foreground'>{page} / {lastPage}</span>
                    <Button size='sm' variant='outline' onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage}>
                        <ChevronRight size={13} />
                    </Button>
                </div>
            )}
        </div>
    )
}

export default function ScheduledPostsContent() {
    const t = useTranslations('SnapiStudio.scheduledPosts')
    const [activeTab, setActiveTab] = useState<TabKey>('scheduled')

    const TABS = [
        { key: 'draft'     as const, label: t('tabs.draft'),     icon: FileText,      status: STUDIO_POST_STATUSES.DRAFT },
        { key: 'scheduled' as const, label: t('tabs.scheduled'), icon: CalendarClock, status: STUDIO_POST_STATUSES.SCHEDULED },
        { key: 'published' as const, label: t('tabs.published'), icon: CheckCircle2,  status: STUDIO_POST_STATUSES.PUBLISHED },
        { key: 'failed'    as const, label: t('tabs.failed'),    icon: AlertCircle,   status: STUDIO_POST_STATUSES.FAILED },
    ]

    const activeStatus = TABS.find(tab => tab.key === activeTab)!.status

    return (
        <div className='space-y-4'>
            <div className='flex gap-1 border-b border-border'>
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key} onClick={() => setActiveTab(key)}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                            activeTab === key
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                        )}
                    >
                        <Icon size={14} />{label}
                    </button>
                ))}
            </div>
            <TabContent key={activeTab} status={activeStatus} />
        </div>
    )
}
