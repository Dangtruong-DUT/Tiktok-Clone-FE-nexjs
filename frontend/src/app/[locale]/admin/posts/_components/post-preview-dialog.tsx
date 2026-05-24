'use client'

import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import VideoPlayer from '@/components/dialog-video-player'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useGetPostDetailQuery } from '@/store/services/posts.service'
import { getPostStatus, getPostStatusColor } from '@/utils/admin/admin.util'
import { formatNumber } from '@/utils/formatting/format-number.util'
import { formatDateTime } from '@/utils/formatting/format-time.util'
import type { AdminPost } from '@/types/dtos/admin/admin-response.dto'

interface PostPreviewDialogProps {
    open: boolean
    post: AdminPost
    onOpenChange: (open: boolean) => void
}

export function PostPreviewDialog({ open, post, onOpenChange }: PostPreviewDialogProps) {
    const t = useTranslations('AdminPage')

    const { data, isLoading } = useGetPostDetailQuery(post.uuid, {
        skip: !open
    })
    const postDetail = data?.data

    const status = getPostStatus(post)
    const authorName = postDetail?.author?.username || post.author?.username || 'N/A'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[980px] p-0 overflow-hidden'>
                <div className='flex flex-col md:flex-row'>
                    <div className='relative h-[320px] w-full bg-black md:h-[520px] md:w-[55%]'>
                        {postDetail && !isLoading ? (
                            postDetail.medias?.length ? (
                                <VideoPlayer post={postDetail} />
                            ) : (
                                <div className='flex h-full items-center justify-center text-xs text-muted-foreground'>
                                    {t('posts.preview.noMedia')}
                                </div>
                            )
                        ) : (
                            <div className='flex h-full items-center justify-center text-xs text-muted-foreground'>
                                {t('posts.preview.loading')}
                            </div>
                        )}
                    </div>

                    <div className='flex w-full flex-col gap-4 p-5 md:w-[45%]'>
                        <DialogHeader>
                            <DialogTitle>{t('posts.preview.title')}</DialogTitle>
                        </DialogHeader>

                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                <Avatar className='size-10'>
                                    <AvatarImage src={postDetail?.author?.avatar || post.author?.avatar || undefined} />
                                    <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className='text-sm font-semibold'>{authorName}</p>
                                    <p className='text-xs text-muted-foreground'>
                                        {formatDateTime(postDetail?.created_at || post.created_at)}
                                    </p>
                                </div>
                            </div>
                            <Badge className={getPostStatusColor(status)}>{status}</Badge>
                        </div>

                        <div className='space-y-2 rounded-lg border bg-muted/30 p-3 text-sm'>
                            <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                                {t('posts.preview.fields.content')}
                            </p>
                            {isLoading ? (
                                <div className='space-y-2'>
                                    <Skeleton className='h-4 w-full' />
                                    <Skeleton className='h-4 w-4/5' />
                                </div>
                            ) : (
                                <p className='text-sm text-foreground'>{postDetail?.content || post.content}</p>
                            )}
                        </div>

                        <div className='grid grid-cols-2 gap-3 text-sm'>
                            <StatItem
                                label={t('posts.preview.stats.likes')}
                                value={formatNumber(postDetail?.likes_count ?? 0)}
                            />
                            <StatItem
                                label={t('posts.preview.stats.comments')}
                                value={formatNumber(postDetail?.comments_count ?? 0)}
                            />
                            <StatItem
                                label={t('posts.preview.stats.bookmarks')}
                                value={formatNumber(postDetail?.bookmarks_count ?? 0)}
                            />
                            <StatItem
                                label={t('posts.preview.stats.views')}
                                value={formatNumber((postDetail?.guest_views ?? 0) + (postDetail?.user_views ?? 0))}
                            />
                        </div>

                        <div className='mt-auto flex justify-end'>
                            <Button variant='outline' onClick={() => onOpenChange(false)}>
                                {t('common.cancel')}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function StatItem({ label, value }: { label: string; value: string }) {
    return (
        <div className='rounded-lg border bg-background p-3'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>{label}</p>
            <p className='mt-1 text-base font-semibold'>{value}</p>
        </div>
    )
}
