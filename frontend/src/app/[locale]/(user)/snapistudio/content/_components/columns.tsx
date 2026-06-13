'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import type { Row, ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, PencilLine, Trash2, CalendarClock, CheckCircle2, Clock } from 'lucide-react'
import { BsFillImageFill } from 'react-icons/bs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { usePostTableContext } from '@/app/[locale]/(user)/snapistudio/content/_context/content-table.context'
import { usePublishNowMutation, useCancelScheduleMutation } from '@/store/services/content/studio-post-schedule.service'
import { SNAPISTUDIO_ROUTES } from '@/constants/routes/routes'
import type { StudioPostItem } from '@/types/models/studio-post.model'

function fmtDateTime(iso: string | null | undefined): string {
    if (!iso) return '—'
    return iso.slice(0, 16).replace('T', ' ')
}

const STATUS_STYLE: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground border-border',
    scheduled:
        'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900',
    published:
        'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900',
    failed: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900'
}

type PostCellProps = {
    row: Row<StudioPostItem>
}

function ContentCell({ row }: PostCellProps) {
    const t = useTranslations('SnapiStudio.content.table')
    const { thumbnail_url, content } = row.original

    return (
        <div className='flex gap-3 items-center py-1'>
            {thumbnail_url ? (
                <Image
                    src={thumbnail_url}
                    width={52}
                    height={72}
                    alt={t('columns.contentThumbnailAlt')}
                    className='object-cover w-[52px] h-[72px] rounded-lg'
                />
            ) : (
                <div className='w-[52px] h-[72px] flex items-center justify-center bg-muted rounded-lg border shrink-0'>
                    <BsFillImageFill className='text-muted-foreground' />
                </div>
            )}

            <div className='flex flex-col gap-1 min-w-0'>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className='truncate font-medium text-sm max-w-[180px] hover:underline cursor-help block text-foreground'>
                            {content || <span className='italic text-muted-foreground'>—</span>}
                        </span>
                    </TooltipTrigger>
                    {content && (
                        <TooltipContent side='top' className='max-w-xs'>
                            <p className='text-xs'>{content}</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </div>
        </div>
    )
}

function StatusCell({ row }: PostCellProps) {
    const { status, status_label } = row.original

    return (
        <Badge variant='outline' className={cn('text-xs font-medium', STATUS_STYLE[status] ?? STATUS_STYLE.draft)}>
            {status_label}
        </Badge>
    )
}

function ScheduledAtCell({ row }: PostCellProps) {
    const t = useTranslations('SnapiStudio.content.table')
    const sched = row.original.scheduled_post

    if (!sched?.scheduled_at) return <span className='text-xs text-muted-foreground'>—</span>

    return (
        <div className='flex items-center gap-1 text-xs text-foreground'>
            <CalendarClock className='size-3 text-yellow-500 shrink-0' />
            <span className='tabular-nums'>{fmtDateTime(sched.scheduled_at)}</span>
            <span className='sr-only'>{t('columns.scheduledAt')}</span>
        </div>
    )
}

function PublishedAtCell({ row }: PostCellProps) {
    const t = useTranslations('SnapiStudio.content.table')
    const iso = row.original.published_at

    if (!iso) return <span className='text-xs text-muted-foreground'>—</span>

    return (
        <div className='flex items-center gap-1 text-xs text-foreground'>
            <CheckCircle2 className='size-3 text-green-500 shrink-0' />
            <span className='tabular-nums'>{fmtDateTime(iso)}</span>
            <span className='sr-only'>{t('columns.publishedAt')}</span>
        </div>
    )
}

function CreatedAtCell({ row }: PostCellProps) {
    const t = useTranslations('SnapiStudio.content.table')

    return (
        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
            <Clock className='size-3 shrink-0' />
            <span className='tabular-nums'>{fmtDateTime(row.original.created_at)}</span>
            <span className='sr-only'>{t('columns.createdAt')}</span>
        </div>
    )
}

function ActionsCell({ row }: PostCellProps) {
    const t = useTranslations('SnapiStudio.content.table')
    const { setPostIdDelete } = usePostTableContext()
    const [publishNow, { isLoading: isPublishing }] = usePublishNowMutation()
    const [cancelSched, { isLoading: isCancelling }] = useCancelScheduleMutation()

    const post = row.original
    const schedPost = post.scheduled_post

    const handlePublishNow = async () => {
        try {
            const response = await publishNow(post.uuid).unwrap()
            toast.success(response.message)
        } catch {
            toast.error(t('messages.publishFailed'))
        }
    }

    const handleCancelSchedule = async () => {
        if (!schedPost) return

        try {
            const response = await cancelSched(schedPost.uuid).unwrap()
            toast.success(response.message)
        } catch {
            toast.error(t('messages.cancelScheduleFailed'))
        }
    }

    return (
        <div className='flex items-center gap-1'>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        asChild
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-muted-foreground hover:text-foreground'
                    >
                        <Link
                            href={`${SNAPISTUDIO_ROUTES.UPLOAD_POST(post.uuid)}?from=${encodeURIComponent(SNAPISTUDIO_ROUTES.CONTENT)}`}
                        >
                            <PencilLine className='h-4 w-4' />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t('actions.edit')}</p>
                </TooltipContent>
            </Tooltip>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground hover:text-foreground'>
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

                    {(post.status === 'draft' || post.status === 'scheduled' || post.status === 'failed') && (
                        <DropdownMenuItem disabled={isPublishing} onClick={handlePublishNow}>
                            <CheckCircle2 className='mr-2 h-4 w-4' />
                            {t('actions.publishNow')}
                        </DropdownMenuItem>
                    )}

                    {post.status === 'scheduled' && schedPost && (
                        <DropdownMenuItem disabled={isCancelling} onClick={handleCancelSchedule}>
                            <CalendarClock className='mr-2 h-4 w-4' />
                            {t('actions.cancelSchedule')}
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className='cursor-pointer text-red-600 focus:text-red-600'
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

export function useStudioColumns(): ColumnDef<StudioPostItem>[] {
    const t = useTranslations('SnapiStudio.content.table')

    return useMemo(
        () => [
            {
                accessorKey: 'content',
                header: t('columns.content'),
                cell: ({ row }) => <ContentCell row={row} />
            },
            {
                accessorKey: 'status',
                header: t('columns.status'),
                cell: ({ row }) => <StatusCell row={row} />
            },
            {
                id: 'scheduled_at',
                header: t('columns.scheduledAt'),
                cell: ({ row }) => <ScheduledAtCell row={row} />
            },
            {
                accessorKey: 'published_at',
                header: t('columns.publishedAt'),
                cell: ({ row }) => <PublishedAtCell row={row} />
            },
            {
                accessorKey: 'created_at',
                header: t('columns.createdAt'),
                cell: ({ row }) => <CreatedAtCell row={row} />
            },
            {
                id: 'actions',
                header: t('columns.actions'),
                cell: ({ row }) => <ActionsCell row={row} />
            }
        ],
        [t]
    )
}

export const useColumns = useStudioColumns
