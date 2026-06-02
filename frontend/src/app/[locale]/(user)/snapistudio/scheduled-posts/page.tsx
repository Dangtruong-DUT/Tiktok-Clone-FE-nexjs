'use client'

import { useState, useCallback } from 'react'
import { Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, Pencil, CalendarClock, FileText, Send, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    useListStudioPostsQuery,
    useSchedulePostMutation,
    useReschedulePostMutation,
    usePublishNowMutation,
    useCancelScheduleMutation,
} from '@/store/services/studio-post-schedule.service'
import { STUDIO_POST_STATUSES } from '@/constants/studio-post'
import type { StudioPostStatus, StudioPostItem } from '@/types/models/studio-post.model'

const TABS = [
    { key: 'draft',     label: 'Bản nháp',  icon: FileText,      status: STUDIO_POST_STATUSES.DRAFT     },
    { key: 'scheduled', label: 'Lên lịch',  icon: CalendarClock, status: STUDIO_POST_STATUSES.SCHEDULED },
    { key: 'published', label: 'Đã đăng',   icon: CheckCircle2,  status: STUDIO_POST_STATUSES.PUBLISHED },
    { key: 'failed',    label: 'Thất bại',  icon: AlertCircle,   status: STUDIO_POST_STATUSES.FAILED    },
] as const

type TabKey = (typeof TABS)[number]['key']

function formatDateTime(iso: string, tz?: string): string {
    try {
        const d = new Date(iso)
        return d.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
    } catch {
        return iso.slice(0, 16).replace('T', ' ')
    }
}

/** Convert ISO string → datetime-local input value */
function toDatetimeLocal(iso: string): string {
    return iso.slice(0, 16)
}

/** Convert datetime-local input → ISO string */
function fromDatetimeLocal(value: string): string {
    return new Date(value).toISOString()
}


interface RescheduleInlineProps {
    schedUuid:    string
    currentTime:  string
    timezone:     string
    onSaved:      () => void
    onCancel:     () => void
}

function RescheduleInline({ schedUuid, currentTime, timezone, onSaved, onCancel }: RescheduleInlineProps) {
    const [value, setValue]             = useState(toDatetimeLocal(currentTime))
    const [reschedule, { isLoading }]   = useReschedulePostMutation()

    const handleSave = async () => {
        try {
            await reschedule({
                schedUuid,
                scheduled_at: fromDatetimeLocal(value),
                timezone,
            }).unwrap()
            toast.success('Đã cập nhật thời gian đăng!')
            onSaved()
        } catch {
            toast.error('Không thể cập nhật. Vui lòng thử lại.')
        }
    }

    return (
        <div className='flex items-center gap-2 mt-2 flex-wrap'>
            <input
                type='datetime-local'
                value={value}
                onChange={e => setValue(e.target.value)}
                min={toDatetimeLocal(new Date().toISOString())}
                className='rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary/50'
            />
            <Button size='sm' className='h-7 text-xs gap-1' onClick={handleSave} disabled={isLoading}>
                {isLoading ? <RefreshCw size={11} className='animate-spin' /> : <CheckCircle2 size={11} />}
                Xác nhận
            </Button>
            <Button size='sm' variant='ghost' className='h-7 text-xs' onClick={onCancel}>
                Hủy
            </Button>
        </div>
    )
}

interface ScheduleDialogInlineProps {
    postUuid: string
    onSaved:  () => void
    onCancel: () => void
}

function ScheduleDialogInline({ postUuid, onSaved, onCancel }: ScheduleDialogInlineProps) {
    const minDate = toDatetimeLocal(new Date(Date.now() + 60_000).toISOString())
    const [value, setValue]         = useState(minDate)
    const [schedule, { isLoading }] = useSchedulePostMutation()

    const handleSchedule = async () => {
        try {
            await schedule({
                postUuid,
                scheduled_at: fromDatetimeLocal(value),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }).unwrap()
            toast.success('Bài đăng đã được lên lịch!')
            onSaved()
        } catch {
            toast.error('Không thể lên lịch. Vui lòng thử lại.')
        }
    }

    return (
        <div className='flex items-center gap-2 mt-2 flex-wrap'>
            <input
                type='datetime-local'
                value={value}
                min={minDate}
                onChange={e => setValue(e.target.value)}
                className='rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary/50'
            />
            <Button size='sm' className='h-7 text-xs gap-1' onClick={handleSchedule} disabled={isLoading}>
                {isLoading ? <RefreshCw size={11} className='animate-spin' /> : <CalendarClock size={11} />}
                Lên lịch
            </Button>
            <Button size='sm' variant='ghost' className='h-7 text-xs' onClick={onCancel}>Hủy</Button>
        </div>
    )
}


interface PostCardProps {
    post: StudioPostItem
}

function PostCard({ post }: PostCardProps) {
    const [rescheduleOpen, setRescheduleOpen]   = useState(false)
    const [scheduleOpen,   setScheduleOpen]     = useState(false)

    const [publishNow,  { isLoading: isPublishing }]  = usePublishNowMutation()
    const [cancelSched, { isLoading: isCancelling }]  = useCancelScheduleMutation()

    const schedPost  = post.scheduled_post
    const isPending  = schedPost?.status === 'pending'
    const isFailed   = post.status === 'failed'
    const isDraft    = post.status === 'draft'
    const isPublished = post.status === 'published'

    const handlePublishNow = async () => {
        await publishNow(post.uuid).unwrap()
        toast.success('Bài đăng đã được đăng ngay!')
    }

    const handleCancel = async () => {
        if (!schedPost) return
        await cancelSched(schedPost.uuid).unwrap()
        toast.success('Đã hủy lịch đăng.')
    }

    return (
        <div className='rounded-xl border border-border bg-card p-4 space-y-2.5'>
            {/* Status + time */}
            <div className='flex items-center justify-between gap-2'>
                <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    post.status === 'draft'     && 'bg-muted text-muted-foreground',
                    post.status === 'scheduled' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400',
                    post.status === 'published' && 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
                    post.status === 'failed'    && 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
                )}>
                    {post.status_label}
                </span>

                {schedPost?.scheduled_at && (
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
                <p className='text-sm leading-relaxed line-clamp-2 text-foreground/90'>
                    {post.content}
                </p>
            ) : (
                <p className='text-sm italic text-muted-foreground'>Chưa có nội dung</p>
            )}

            {/* Error */}
            {schedPost?.error_message && (
                <p className='text-xs text-destructive'>{schedPost.error_message}</p>
            )}

            {/* Actions */}
            <div className='flex flex-wrap gap-1.5 pt-1'>
                {/* Draft actions */}
                {isDraft && !scheduleOpen && (
                    <>
                        <Button size='sm' variant='outline' className='h-7 text-xs gap-1' onClick={() => setScheduleOpen(true)}>
                            <CalendarClock size={11} />
                            Lên lịch
                        </Button>
                        <Button size='sm' className='h-7 text-xs gap-1' onClick={handlePublishNow} disabled={isPublishing}>
                            {isPublishing ? <RefreshCw size={11} className='animate-spin' /> : <Send size={11} />}
                            Đăng ngay
                        </Button>
                    </>
                )}

                {/* Pending scheduled actions */}
                {isPending && !rescheduleOpen && (
                    <>
                        <Button size='sm' className='h-7 text-xs gap-1' onClick={handlePublishNow} disabled={isPublishing}>
                            {isPublishing ? <RefreshCw size={11} className='animate-spin' /> : <Send size={11} />}
                            Đăng ngay
                        </Button>
                        <Button size='sm' variant='outline' className='h-7 text-xs gap-1' onClick={() => setRescheduleOpen(true)}>
                            <Pencil size={11} />
                            Đổi giờ
                        </Button>
                        <Button size='sm' variant='ghost' className='h-7 text-xs text-destructive gap-1' onClick={handleCancel} disabled={isCancelling}>
                            <XCircle size={11} />
                            Hủy lịch
                        </Button>
                    </>
                )}

                {/* Failed actions */}
                {isFailed && (
                    <Button size='sm' className='h-7 text-xs gap-1' onClick={handlePublishNow} disabled={isPublishing}>
                        {isPublishing ? <RefreshCw size={11} className='animate-spin' /> : <RefreshCw size={11} />}
                        Thử lại
                    </Button>
                )}
            </div>

            {/* Inline reschedule picker */}
            {rescheduleOpen && schedPost && (
                <RescheduleInline
                    schedUuid={schedPost.uuid}
                    currentTime={schedPost.scheduled_at}
                    timezone={schedPost.user_timezone}
                    onSaved={() => setRescheduleOpen(false)}
                    onCancel={() => setRescheduleOpen(false)}
                />
            )}

            {/* Inline schedule picker for draft */}
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
    const [page, setPage] = useState(1)

    const { data, isLoading, isFetching } = useListStudioPostsQuery(
        { status, page, per_page: 10 },
        { refetchOnMountOrArgChange: true }
    )

    const posts    = data?.data ?? []
    const meta     = (data as any)?.meta
    const lastPage = meta?.last_page ?? 1

    if (isLoading) return (
        <div className='space-y-3'>
            {[1,2,3].map(i => <Skeleton key={i} className='h-28 rounded-xl' />)}
        </div>
    )

    if (posts.length === 0) return (
        <div className='flex flex-col items-center gap-2 py-16 text-center'>
            <FileText size={36} className='text-muted-foreground/30' />
            <p className='text-sm text-muted-foreground'>Không có bài đăng nào.</p>
        </div>
    )

    return (
        <div className='space-y-4'>
            <div className={cn('space-y-3', isFetching && 'opacity-60')}>
                {posts.map(post => <PostCard key={post.uuid} post={post} />)}
            </div>

            {lastPage > 1 && (
                <div className='flex items-center justify-center gap-2'>
                    <Button size='sm' variant='outline' onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>
                        <ChevronLeft size={13} />
                    </Button>
                    <span className='text-xs text-muted-foreground'>{page} / {lastPage}</span>
                    <Button size='sm' variant='outline' onClick={() => setPage(p => Math.min(lastPage, p+1))} disabled={page===lastPage}>
                        <ChevronRight size={13} />
                    </Button>
                </div>
            )}
        </div>
    )
}


export default function ScheduledPostsPage() {
    const [activeTab, setActiveTab] = useState<TabKey>('scheduled')

    const activeStatus = TABS.find(t => t.key === activeTab)!.status

    return (
        <div className='max-w-2xl mx-auto p-4 space-y-6'>
            {/* Header */}
            <div className='flex items-center gap-3'>
                <div className='flex size-8 items-center justify-center rounded-lg bg-primary/10'>
                    <CalendarClock size={16} className='text-primary' />
                </div>
                <div>
                    <h1 className='text-lg font-semibold'>Quản lý bài đăng</h1>
                    <p className='text-xs text-muted-foreground'>Bản nháp, lên lịch, và theo dõi bài đã đăng</p>
                </div>
            </div>

            {/* Tabs */}
            <div className='flex gap-1 border-b border-border'>
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                            activeTab === key
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                        )}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <TabContent key={activeTab} status={activeStatus} />
        </div>
    )
}
