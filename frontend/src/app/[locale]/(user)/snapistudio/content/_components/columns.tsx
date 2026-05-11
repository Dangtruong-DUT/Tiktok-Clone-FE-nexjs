'use client'

import { useTranslations } from 'next-intl'
import { ColumnDef } from '@tanstack/react-table'
import AudienceSelect from '@/components/audience-select'
import { Audience } from '@/constants/enum'
import Image from 'next/image'
import { formatISOToDisplayDate } from '@/utils/formatting/formatTime.util'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, PencilLine, Trash2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { formatCompactNumber } from '@/utils/formatting/formatNumber.util'
import { usePostTableContext } from '@/app/[locale]/(user)/snapistudio/content/_context/content-table.context'
import { BsFillImageFill } from 'react-icons/bs'
import { useEffect, useMemo, useState } from 'react'
import { TikTokPostType } from '@/types/models/post.model'
import VideoDetailDialog from '@/components/video-dialog'

export function useColumns(): ColumnDef<TikTokPostType>[] {
    const t = useTranslations('SnapiStudio.content.table')

    return useMemo(
        () => [
            {
                accessorKey: 'content',
                header: t('columns.content'),
                cell: function Content({ row }) {
                    const [isModalDetailOpen, setIsModalDetailOpen] = useState<boolean>(false)
                    const { thumbnail_url, content, created_at } = row.original
                    return (
                        <div className='flex gap-3 items-center py-1'>
                            {thumbnail_url ? (
                                <Image
                                    src={thumbnail_url}
                                    width={52}
                                    height={72}
                                    alt=''
                                    className='object-cover w-[52px] h-[72px] rounded-lg shrink-0'
                                />
                            ) : (
                                <div className='w-[52px] h-[72px] flex items-center justify-center bg-muted rounded-lg border shrink-0'>
                                    <BsFillImageFill className='text-muted-foreground' />
                                </div>
                            )}
                            <div className='flex flex-col gap-1 min-w-0'>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span
                                            className='truncate font-medium text-sm max-w-[180px] hover:underline cursor-pointer block'
                                            onClick={() => setIsModalDetailOpen(true)}
                                        >
                                            {content || '—'}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side='top' className='max-w-xs'>
                                        <p className='text-xs'>{content}</p>
                                    </TooltipContent>
                                </Tooltip>
                                <span className='text-muted-foreground text-xs'>
                                    {formatISOToDisplayDate(created_at)}
                                </span>
                            </div>
                            <VideoDetailDialog
                                isVisible={isModalDetailOpen}
                                handleClose={() => setIsModalDetailOpen(false)}
                                post={row.original}
                                isLoading={!row.original}
                                key={row.original.uuid}
                            />
                        </div>
                    )
                }
            },
            {
                accessorKey: 'audience',
                header: t('columns.privacy'),
                cell: function PrivacySelect({ row }) {
                    const originalRow = row.original
                    const { changeAudienceStatus, getAudienceStatus, clearAudienceStatus } = usePostTableContext()

                    const serverAudience = Number(row.getValue('audience')) as Audience
                    const displayedAudience = getAudienceStatus({
                        postId: originalRow.uuid,
                        fallback: serverAudience
                    })

                    useEffect(() => {
                        if (displayedAudience === serverAudience) {
                            clearAudienceStatus(originalRow.uuid)
                        }
                    }, [clearAudienceStatus, displayedAudience, originalRow.uuid, serverAudience])

                    return (
                        <AudienceSelect
                            value={displayedAudience.toString()}
                            onValueChange={(status) =>
                                changeAudienceStatus({ status: Number(status), postId: originalRow.uuid })
                            }
                            className='w-[140px]'
                            placeholder={t('columns.privacy')}
                        />
                    )
                }
            },
            {
                accessorKey: 'Views',
                header: t('columns.views'),
                cell: ({ row }) => {
                    const { user_views = 0, guest_views = 0 } = row.original
                    return (
                        <span className='text-sm font-medium'>
                            {formatCompactNumber(Number(user_views) + Number(guest_views))}
                        </span>
                    )
                }
            },
            {
                accessorKey: 'comments_count',
                header: t('columns.comments'),
                cell: ({ row }) => (
                    <span className='text-sm font-medium'>
                        {formatCompactNumber(row.getValue('comments_count'))}
                    </span>
                )
            },
            {
                id: 'actions',
                header: t('columns.actions'),
                cell: function Actions({ row }) {
                    const post = row.original
                    const { setPostIdDelete } = usePostTableContext()

                    return (
                        <div className='flex items-center gap-1'>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={`/snapistudio/upload/post/${post.uuid}?from=${encodeURIComponent('/snapistudio/content')}`}
                                    >
                                        <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground hover:text-foreground'>
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
                                    <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground hover:text-foreground'>
                                        <MoreHorizontal className='h-4 w-4' />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end' className='w-40'>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/snapistudio/upload/post/${post.uuid}?from=${encodeURIComponent('/snapistudio/content')}`} className='cursor-pointer'>
                                            <PencilLine className='mr-2 h-4 w-4' />
                                            {t('actions.edit')}
                                        </Link>
                                    </DropdownMenuItem>
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
