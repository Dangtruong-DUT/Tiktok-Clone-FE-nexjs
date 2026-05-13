'use client'

import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle } from 'lucide-react'
import { formatAdminDate, formatNumber } from '@/helpers/admin-helpers'
import { APPEAL_STATUSES } from '@/constants/status/appeal'
import type { AdminAppeal } from '@/types/dtos/admin/admin-response.dto'
import { EvidenceGalleryDialog } from './evidence-gallery-dialog'
import { useState } from 'react'
import { useGetPostDetailQuery } from '@/store/services/posts.service'
import VideoPlayer from '@/components/video-player-v3'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AppealDetailDialogProps {
    open: boolean
    appeal: AdminAppeal
    onOpenChange: (open: boolean) => void
}

const STATUS_STYLE: Record<string, string> = {
    [APPEAL_STATUSES.PENDING]: 'bg-amber-50 text-amber-700 border-amber-200',
    [APPEAL_STATUSES.APPROVED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    [APPEAL_STATUSES.REJECTED]: 'bg-red-50 text-red-700 border-red-200'
}

export function AppealDetailDialog({ open, appeal, onOpenChange }: AppealDetailDialogProps) {
    const t = useTranslations('AdminPage')
    const [showGallery, setShowGallery] = useState(false)

    const resourceId = appeal.resource_id ? String(appeal.resource_id) : undefined
    const shouldFetchPost = open && appeal.resource_type === 'post' && resourceId

    const { data: postDetailRes, isLoading: isPostLoading } = useGetPostDetailQuery(resourceId || '', {
        skip: !shouldFetchPost
    })

    const postDetail = postDetailRes?.data

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[960px]'>
                <DialogHeader>
                    <DialogTitle>{t('appeals.detail.title')}</DialogTitle>
                </DialogHeader>

                {/* Review result banner */}
                {appeal.status === APPEAL_STATUSES.APPROVED && (
                    <div className='flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3'>
                        <CheckCircle2 className='h-5 w-5 text-emerald-600 shrink-0 mt-0.5' />
                        <div>
                            <p className='text-sm font-semibold text-emerald-800 dark:text-emerald-300'>Appeal Approved — Action Reversed</p>
                            {appeal.admin_response && (
                                <p className='text-xs text-emerald-700 dark:text-emerald-400 mt-0.5'>{appeal.admin_response}</p>
                            )}
                        </div>
                    </div>
                )}
                {appeal.status === APPEAL_STATUSES.REJECTED && (
                    <div className='flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 px-4 py-3'>
                        <XCircle className='h-5 w-5 text-red-600 shrink-0 mt-0.5' />
                        <div>
                            <p className='text-sm font-semibold text-red-800 dark:text-red-300'>Appeal Rejected</p>
                            {appeal.admin_response && (
                                <p className='text-xs text-red-700 dark:text-red-400 mt-0.5'>{appeal.admin_response}</p>
                            )}
                        </div>
                    </div>
                )}

                <div className='grid gap-6 md:grid-cols-[1.1fr_0.9fr]'>
                    <div className='space-y-4'>
                        <div className='rounded-lg border bg-muted/30 p-4 text-sm'>
                            <div className='flex items-start justify-between gap-4'>
                                <div className='flex items-center gap-3'>
                                    <Avatar className='size-10'>
                                        <AvatarImage src={appeal.user?.avatar || undefined} />
                                        <AvatarFallback>
                                            {(appeal.user?.username || 'U').charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className='text-sm font-semibold'>{appeal.user?.username || 'N/A'}</p>
                                        <p className='text-xs text-muted-foreground'>{appeal.user?.email || '—'}</p>
                                    </div>
                                </div>
                                <Badge variant='outline' className={`${STATUS_STYLE[appeal.status] ?? ''} border`}>
                                    {t(`appeals.statuses.${appeal.status}`)}
                                </Badge>
                            </div>

                            <div className='mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground'>
                                <DetailRow label={t('appeals.detail.fields.type')} value={appeal.appeal_type} />
                                <DetailRow label={t('appeals.detail.fields.status')} value={appeal.status} />
                                <DetailRow
                                    label={t('appeals.detail.fields.createdAt')}
                                    value={formatAdminDate(appeal.created_at)}
                                />
                                <DetailRow
                                    label={t('appeals.detail.fields.reviewedAt')}
                                    value={appeal.reviewed_at ? formatAdminDate(appeal.reviewed_at) : '—'}
                                />
                                <DetailRow
                                    label={t('appeals.detail.fields.resourceType')}
                                    value={appeal.resource_type}
                                />
                                <DetailRow
                                    label={t('appeals.detail.fields.resourceId')}
                                    value={appeal.resource_id ? `#${appeal.resource_id}` : '—'}
                                />
                            </div>
                        </div>

                        <div className='rounded-lg border bg-background p-4 text-sm'>
                            <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                                {t('appeals.detail.fields.reason')}
                            </p>
                            <p className='mt-2 text-sm text-foreground'>{appeal.reason || '—'}</p>
                        </div>

                        <div className='rounded-lg border bg-background p-4 text-sm'>
                            <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                                {t('appeals.detail.fields.response')}
                            </p>
                            <p className='mt-2 text-sm text-foreground'>{appeal.admin_response || '—'}</p>
                        </div>

                        <div className='rounded-lg border bg-background p-4 text-sm'>
                            <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                                {t('appeals.detail.evidenceTitle')}
                            </p>
                            <div className='mt-2 flex items-center justify-between'>
                                <span className='text-sm text-foreground'>
                                    {appeal.evidence_files?.length
                                        ? t('appeals.evidenceDialog.imageCount', {
                                              current: formatNumber(appeal.evidence_files.length),
                                              total: formatNumber(appeal.evidence_files.length)
                                          })
                                        : t('appeals.detail.noEvidence')}
                                </span>
                                {appeal.evidence_files?.length ? (
                                    <Button size='sm' variant='outline' onClick={() => setShowGallery(true)}>
                                        {t('appeals.actions.viewDetails')}
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className='space-y-3'>
                        <p className='text-sm font-semibold'>{t('appeals.detail.resourceTitle')}</p>
                        <div className='rounded-lg border bg-muted/20 p-3'>
                            {appeal.resource_type === 'post' ? (
                                postDetail && !isPostLoading ? (
                                    <div className='space-y-3'>
                                        <div className='h-[240px] overflow-hidden rounded-lg bg-black'>
                                            {postDetail.medias?.length ? (
                                                <VideoPlayer post={postDetail} />
                                            ) : (
                                                <div className='flex h-full items-center justify-center text-xs text-muted-foreground'>
                                                    {t('posts.preview.noMedia')}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className='text-sm font-semibold'>{postDetail.author?.username}</p>
                                            <p className='text-xs text-muted-foreground'>
                                                {formatAdminDate(postDetail.created_at)}
                                            </p>
                                            <p className='mt-2 text-sm'>{postDetail.content}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className='text-sm text-muted-foreground'>
                                        {t('appeals.detail.resourceUnavailable')}
                                    </p>
                                )
                            ) : (
                                <p className='text-sm text-muted-foreground'>
                                    {t('appeals.detail.resourceUnavailable')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className='gap-2'>
                    <Button variant='outline' onClick={() => onOpenChange(false)}>
                        {t('common.cancel')}
                    </Button>
                </DialogFooter>
            </DialogContent>

            {appeal.evidence_files && (
                <EvidenceGalleryDialog
                    open={showGallery}
                    onOpenChange={setShowGallery}
                    evidenceFiles={appeal.evidence_files}
                    appealId={appeal.id}
                />
            )}
        </Dialog>
    )
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className='text-xs uppercase tracking-wide'>{label}</p>
            <p className='mt-1 text-sm text-foreground'>{value}</p>
        </div>
    )
}
