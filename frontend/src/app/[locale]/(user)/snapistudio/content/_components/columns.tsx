'use client'

import { useTranslations } from 'next-intl'
import { ColumnDef } from '@tanstack/react-table'
import { Audience } from '@/constants/enum'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, PencilLine, Trash2, CalendarClock, CheckCircle2, Clock, Eye } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { usePostTableContext } from '@/app/[locale]/(user)/snapistudio/content/_context/content-table.context'
import { BsFillImageFill } from 'react-icons/bs'
import { useState, useMemo } from 'react'
import VideoDetailDialog from '@/components/video-dialog'
import { SNAPISTUDIO_ROUTES } from '@/constants/routes/routes'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { usePublishNowMutation, useCancelScheduleMutation } from '@/store/services/studio-post-schedule.service'
import { useDeletePostMutation } from '@/store/services/posts.service'
import type { StudioPostItem } from '@/types/models/studio-post.model'

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDateTime(iso: string | null | undefined): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleString(undefined, {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const STATUS_STYLE: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground border-border',
    scheduled:
        'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900',
    published:
        'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900',
    failed: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900'
}

// ── Columns ───────────────────────────────────────────────────────────────────
export function useStudioColumns(): ColumnDef<StudioPostItem>[] {
    const t = useTranslations('SnapiStudio.content.table')

    return useMemo(
        () => [
            // ── Content (thumbnail + text) ────────────────────────────────────────
            {
                accessorKey: 'content',
                header: t('columns.content'),
                cell: function ContentCell({ row }) {
                    const [detailOpen, setDetailOpen] = useState(false)
                    const { thumbnail_url, content, created_at } = row.original

                    return (
                        <div className='flex gap-3 items-center py-1'>
                            <button
                                type='button'
                                onClick={() => setDetailOpen(true)}
                                className='shrink-0 hover:opacity-80 transition-opacity'
                            >
                                {thumbnail_url ? (
                                    <Image
                                        src={thumbnail_url}
                                        width={52}
                                        height={72}
                                        alt=''
                                        className='object-cover w-[52px] h-[72px] rounded-lg'
                                    />
                                ) : (
                                    <div className='w-[52px] h-[72px] flex items-center justify-center bg-muted rounded-lg border shrink-0'>
                                        <BsFillImageFill className='text-muted-foreground' />
                                    </div>
                                )}
                            </button>
                            <div className='flex flex-col gap-1 min-w-0'>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span
                                            className='truncate font-medium text-sm max-w-[180px] hover:underline cursor-pointer block text-foreground'
                                            onClick={() => setDetailOpen(true)}
                                        >
                                            {content || <span className='italic text-muted-foreground'>—</span>}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side='top' className='max-w-xs'>
                                        <p className='text-xs'>{content}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            {/* VideoDetailDialog requires TikTokPostType — show minimal dialog */}
                        </div>
                    )
                }
            },

            // ── Status ────────────────────────────────────────────────────────────
            {
                accessorKey: 'status',
                header: 'Trạng thái',
                cell: ({ row }) => {
                    const { status, status_label } = row.original
                    return (
                        <Badge
                            variant='outline'
                            className={cn('text-xs font-medium', STATUS_STYLE[status] ?? STATUS_STYLE.draft)}
                        >
                            {status_label}
                        </Badge>
                    )
                }
            },

            // ── Scheduled at ─────────────────────────────────────────────────────
            {
                id: 'scheduled_at',
                header: 'Dự kiến đăng',
                cell: ({ row }) => {
                    const sched = row.original.scheduled_post
                    if (!sched?.scheduled_at) return <span className='text-xs text-muted-foreground'>—</span>
                    return (
                        <div className='flex items-center gap-1 text-xs text-foreground'>
                            <CalendarClock className='size-3 text-yellow-500 shrink-0' />
                            <span className='tabular-nums'>{fmtDateTime(sched.scheduled_at)}</span>
                        </div>
                    )
                }
            },

            // ── Published at ─────────────────────────────────────────────────────
            {
                accessorKey: 'published_at',
                header: 'Đã đăng lúc',
                cell: ({ row }) => {
                    const iso = row.original.published_at
                    if (!iso) return <span className='text-xs text-muted-foreground'>—</span>
                    return (
                        <div className='flex items-center gap-1 text-xs text-foreground'>
                            <CheckCircle2 className='size-3 text-green-500 shrink-0' />
                            <span className='tabular-nums'>{fmtDateTime(iso)}</span>
                        </div>
                    )
                }
            },

            // ── Created at ───────────────────────────────────────────────────────
            {
                accessorKey: 'created_at',
                header: 'Tạo lúc',
                cell: ({ row }) => (
                    <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                        <Clock className='size-3 shrink-0' />
                        <span className='tabular-nums'>{fmtDateTime(row.original.created_at)}</span>
                    </div>
                )
            },

            // ── Actions ──────────────────────────────────────────────────────────
            {
                id: 'actions',
                header: t('columns.actions'),
                cell: function Actions({ row }) {
                    const post = row.original
                    const { setPostIdDelete } = usePostTableContext()
                    const [publishNow, { isLoading: isPublishing }] = usePublishNowMutation()
                    const [cancelSched, { isLoading: isCancelling }] = useCancelScheduleMutation()
                    const schedPost = post.scheduled_post

                    return (
                        <div className='flex items-center gap-1'>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={`${SNAPISTUDIO_ROUTES.UPLOAD_POST(post.uuid)}?from=${encodeURIComponent(SNAPISTUDIO_ROUTES.CONTENT)}`}
                                    >
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8 text-muted-foreground hover:text-foreground'
                                        >
                                            <PencilLine className='h-4 w-4' />
                                        </Button>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('actions.edit')}</p>
                                </TooltipContent>
                            </Tooltip>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='h-8 w-8 text-muted-foreground hover:text-foreground'
                                    >
                                        <MoreHorizontal className='h-4 w-4' />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end' className='w-44'>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`${SNAPISTUDIO_ROUTES.UPLOAD_POST(post.uuid)}?from=${encodeURIComponent(SNAPISTUDIO_ROUTES.CONTENT)}`}
                                            className='cursor-pointer'
                                        >
                                            <PencilLine className='mr-2 h-4 w-4' />
                                            {t('actions.edit')}
                                        </Link>
                                    </DropdownMenuItem>

                                    {(post.status === 'draft' ||
                                        post.status === 'scheduled' ||
                                        post.status === 'failed') && (
                                        <DropdownMenuItem
                                            disabled={isPublishing}
                                            onClick={() =>
                                                publishNow(post.uuid)
                                                    .then(() => toast.success('Đã đăng bài!'))
                                                    .catch(() => toast.error('Không thể đăng bài.'))
                                            }
                                        >
                                            <CheckCircle2 className='mr-2 h-4 w-4' />
                                            Đăng ngay
                                        </DropdownMenuItem>
                                    )}

                                    {post.status === 'scheduled' && schedPost && (
                                        <DropdownMenuItem
                                            disabled={isCancelling}
                                            onClick={() =>
                                                cancelSched(schedPost.uuid)
                                                    .then(() => toast.success('Đã huỷ lịch'))
                                                    .catch(() => toast.error('Không thể huỷ lịch.'))
                                            }
                                        >
                                            <CalendarClock className='mr-2 h-4 w-4' />
                                            Huỷ lịch đăng
                                        </DropdownMenuItem>
                                    )}

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className='text-red-600 focus:text-red-600 cursor-pointer'
                                        onClick={() => setPostIdDelete(post.uuid)}
                                    >
                                        <Trash2 className='mr-2 h-4 w-4' />
                                        {t('actions.delete')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )
                }
            }
        ],
        [t]
    )
}

// ── Backward-compat export (old name kept so nothing else breaks) ──────────────
export const useColumns = useStudioColumns
