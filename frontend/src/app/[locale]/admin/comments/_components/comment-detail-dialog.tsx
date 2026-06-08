'use client'

import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/utils/formatting/format-time.util'
import { formatNumber } from '@/utils/formatting/format-number.util'
import type { AdminComment } from '@/types/dtos/admin/admin-response.dto'

interface CommentDetailDialogProps {
    open: boolean
    comment: AdminComment
    onOpenChange: (open: boolean) => void
}

export function CommentDetailDialog({ open, comment, onOpenChange }: CommentDetailDialogProps) {
    const t = useTranslations('AdminPage')
    const authorName = comment.author?.username || 'N/A'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[640px]'>
                <DialogHeader>
                    <DialogTitle>{t('comments.detail.title')}</DialogTitle>
                </DialogHeader>

                <div className='space-y-4'>
                    <div className='flex items-center gap-3'>
                        <Avatar className='size-10'>
                            <AvatarImage src={comment.author?.avatar || undefined} alt={authorName} />
                            <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className='text-sm font-semibold'>{authorName}</p>
                            <p className='text-xs text-muted-foreground'>{formatDateTime(comment.created_at)}</p>
                        </div>
                    </div>

                    <div className='rounded-lg border bg-muted/30 p-3 text-sm'>
                        <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                            {t('comments.detail.fields.content')}
                        </p>
                        <p className='mt-2 text-sm text-foreground'>{comment.content}</p>
                    </div>

                    <div className='grid grid-cols-2 gap-3 text-sm'>
                        <DetailItem
                            label={t('comments.detail.fields.likes')}
                            value={formatNumber(comment.likes_count)}
                        />
                        <DetailItem
                            label={t('comments.detail.fields.parentId')}
                            value={comment.parent_id ? `#${comment.parent_id}` : '—'}
                        />
                    </div>
                </div>

                <DialogFooter className='gap-2'>
                    <Button size='lg' variant='outline' onClick={() => onOpenChange(false)}>
                        {t('common.cancel')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className='rounded-lg border bg-background p-3'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>{label}</p>
            <p className='mt-1 text-base font-semibold'>{value}</p>
        </div>
    )
}
