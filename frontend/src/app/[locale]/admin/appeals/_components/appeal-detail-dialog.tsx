'use client'

import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckCircle2, XCircle, FileText, MessageCircle, User as UserIcon, ImageOff } from 'lucide-react'
import Image from 'next/image'
import { formatAdminDate, formatNumber } from '@/helpers/admin-helpers'
import { APPEAL_STATUSES } from '@/constants/status/appeal'
import type { AdminAppeal } from '@/types/dtos/admin/admin-response.dto'
import type { ResourcePreview } from '@/types/models/appeal.model'
import { EvidenceGalleryDialog } from './evidence-gallery-dialog'
import { useState } from 'react'

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

function ResourcePreviewBlock({ preview }: { preview: ResourcePreview }) {
    if (preview.type === 'post') {
        return (
            <div className='space-y-3'>
                {preview.thumbnail_url ? (
                    <div className='relative h-48 w-full overflow-hidden rounded-lg bg-black'>
                        <Image src={preview.thumbnail_url} alt='Post thumbnail' fill className='object-cover' unoptimized />
                        {preview.is_deleted && (
                            <div className='absolute inset-0 flex items-center justify-center bg-black/60'>
                                <span className='rounded-full bg-red-500/90 px-2.5 py-1 text-xs font-medium text-white'>Deleted</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='flex h-32 w-full items-center justify-center rounded-lg border bg-muted/30'>
                        <ImageOff className='h-8 w-8 text-muted-foreground' />
                    </div>
                )}
                {preview.content && (
                    <p className='text-sm text-foreground line-clamp-3'>{preview.content}</p>
                )}
                {preview.author && (
                    <p className='text-xs text-muted-foreground'>@{preview.author.username}</p>
                )}
                <div className='flex gap-3 text-xs text-muted-foreground'>
                    {preview.likes_count != null && <span>❤ {preview.likes_count}</span>}
                    {preview.comments_count != null && <span>💬 {preview.comments_count}</span>}
                </div>
            </div>
        )
    }

    if (preview.type === 'comment') {
        return (
            <div className='space-y-2'>
                <div className='flex items-start gap-2'>
                    <MessageCircle className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
                    <div className='min-w-0 flex-1'>
                        <p className='text-sm text-foreground line-clamp-4'>{preview.content || '—'}</p>
                        {preview.author && (
                            <p className='mt-1 text-xs text-muted-foreground'>@{preview.author.username}</p>
                        )}
                    </div>
                </div>
                {preview.is_deleted && (
                    <Badge variant='outline' className='text-xs border-red-200 text-red-600 bg-red-50'>Deleted</Badge>
                )}
            </div>
        )
    }

    if (preview.type === 'user') {
        return (
            <div className='flex items-center gap-3'>
                <Avatar className='size-12'>
                    <AvatarImage src={preview.avatar ?? undefined} />
                    <AvatarFallback>
                        <UserIcon className='h-5 w-5' />
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className='font-medium text-sm'>@{preview.username}</p>
                    <div className='mt-1 flex gap-1.5'>
                        {preview.is_banned && (
                            <Badge variant='outline' className='text-xs border-orange-200 text-orange-600 bg-orange-50'>Banned</Badge>
                        )}
                        {preview.is_deleted && (
                            <Badge variant='outline' className='text-xs border-red-200 text-red-600 bg-red-50'>Deleted</Badge>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return null
}

export function AppealDetailDialog({ open, appeal, onOpenChange }: AppealDetailDialogProps) {
    const t = useTranslations('AdminPage')
    const [showGallery, setShowGallery] = useState(false)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[960px]'>
                <DialogHeader>
                    <DialogTitle>{t('appeals.detail.title')}</DialogTitle>
                </DialogHeader>

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
                        <div className='rounded-lg border bg-muted/20 p-4'>
                            {appeal.resource_preview ? (
                                <ResourcePreviewBlock preview={appeal.resource_preview} />
                            ) : (
                                <div className='flex flex-col items-center gap-2 py-4 text-center'>
                                    <FileText className='h-8 w-8 text-muted-foreground' />
                                    <p className='text-sm text-muted-foreground'>
                                        {t('appeals.detail.resourceUnavailable')}
                                    </p>
                                </div>
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
