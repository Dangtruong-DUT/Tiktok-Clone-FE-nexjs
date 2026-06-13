'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2, Clock, FileText, XCircle } from 'lucide-react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { APPEAL_STATUSES } from '@/constants/appeal'
import { formatDateTime } from '@/utils/formatting/format-time.util'
import { ResourcePreviewBlock } from './resource-preview'
import { InfoRow } from './info-row'
import type { Appeal } from '@/types/models/appeal.model'

export const STATUS_STYLES: Record<string, string> = {
    [APPEAL_STATUSES.APPROVED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    [APPEAL_STATUSES.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
    [APPEAL_STATUSES.PENDING]: 'bg-amber-50 text-amber-700 border-amber-200'
}

interface AppealDetailDialogProps {
    open: boolean
    appeal: Appeal
    onClose: () => void
}

export function AppealDetailDialog({ open, appeal, onClose }: AppealDetailDialogProps) {
    const t = useTranslations('SnapiStudio.appeals')
    const statusStyle = STATUS_STYLES[appeal.status] ?? STATUS_STYLES[APPEAL_STATUSES.PENDING]
    const hasPreview = appeal.resource_preview != null

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className='sm:max-w-[860px]'>
                <DialogHeader>
                    <DialogTitle>{t('detail.title')}</DialogTitle>
                </DialogHeader>

                <div className='grid gap-5 md:grid-cols-[1fr_1fr]'>
                    <div className='space-y-4'>
                        <div className='rounded-lg border bg-muted/30 p-4 space-y-3 text-sm'>
                            <div className='flex items-center justify-between'>
                                <span className='text-xs uppercase tracking-wide text-muted-foreground font-medium'>
                                    {t('detail.fields.status')}
                                </span>
                                <Badge variant='outline' className={`${statusStyle} border text-xs`}>
                                    {t(`statuses.${appeal.status}`)}
                                </Badge>
                            </div>
                            <InfoRow label={t('detail.fields.type')} value={t(`types.${appeal.appeal_type}`)} />
                            <InfoRow label={t('detail.fields.createdAt')} value={formatDateTime(appeal.created_at)} />
                            {appeal.reviewed_at && (
                                <InfoRow
                                    label={t('detail.fields.reviewedAt')}
                                    value={formatDateTime(appeal.reviewed_at)}
                                />
                            )}
                            {appeal.resource_type && (
                                <InfoRow label={t('detail.fields.resource')} value={appeal.resource_type} />
                            )}
                        </div>

                        <div className='rounded-lg border bg-background p-4 space-y-2'>
                            <p className='text-xs uppercase tracking-wide text-muted-foreground font-medium'>
                                {t('detail.fields.reason')}
                            </p>
                            <p className='text-sm text-foreground whitespace-pre-wrap'>{appeal.reason || '—'}</p>
                        </div>

                        {appeal.status === APPEAL_STATUSES.APPROVED && (
                            <div className='flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3'>
                                <CheckCircle2 className='h-5 w-5 text-emerald-600 shrink-0 mt-0.5' />
                                <div>
                                    <p className='text-sm font-semibold text-emerald-800 dark:text-emerald-300'>
                                        {t('statuses.approved')} — {t('detail.actionReversed')}
                                    </p>
                                    {appeal.admin_response && (
                                        <p className='text-xs text-emerald-700 dark:text-emerald-400 mt-0.5'>
                                            {appeal.admin_response}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        {appeal.status === APPEAL_STATUSES.REJECTED && (
                            <div className='flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 px-4 py-3'>
                                <XCircle className='h-5 w-5 text-red-600 shrink-0 mt-0.5' />
                                <div>
                                    <p className='text-sm font-semibold text-red-800 dark:text-red-300'>
                                        {t('statuses.rejected')}
                                    </p>
                                    {appeal.admin_response && (
                                        <p className='text-xs text-red-700 dark:text-red-400 mt-0.5'>
                                            {appeal.admin_response}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        {appeal.status === APPEAL_STATUSES.PENDING && !appeal.admin_response && (
                            <div className='flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/40 px-4 py-3'>
                                <Clock className='h-5 w-5 text-amber-600 shrink-0 mt-0.5' />
                                <p className='text-sm text-amber-800 dark:text-amber-300'>{t('detail.noResponse')}</p>
                            </div>
                        )}

                        <div className='space-y-2'>
                            <p className='text-xs uppercase tracking-wide text-muted-foreground font-medium'>
                                {t('detail.timeline')}
                            </p>
                            <ol className='relative border-l border-border ml-3 space-y-4'>
                                <li className='pl-5'>
                                    <span className='absolute -left-1.5 mt-1 h-3 w-3 rounded-full border border-background bg-emerald-500' />
                                    <p className='text-xs font-medium text-foreground'>{t('detail.appealSubmitted')}</p>
                                    <p className='text-xs text-muted-foreground'>{formatDateTime(appeal.created_at)}</p>
                                </li>
                                {appeal.reviewed_at && (
                                    <li className='pl-5'>
                                        <span
                                            className={`absolute -left-1.5 mt-1 h-3 w-3 rounded-full border border-background ${
                                                appeal.status === APPEAL_STATUSES.APPROVED
                                                    ? 'bg-emerald-500'
                                                    : 'bg-red-500'
                                            }`}
                                        />
                                        <p className='text-xs font-medium text-foreground'>
                                            {appeal.status === APPEAL_STATUSES.APPROVED
                                                ? t('detail.appealApproved')
                                                : t('detail.appealRejected')}
                                        </p>
                                        <p className='text-xs text-muted-foreground'>
                                            {formatDateTime(appeal.reviewed_at)}
                                        </p>
                                    </li>
                                )}
                                {!appeal.reviewed_at && (
                                    <li className='pl-5 opacity-50'>
                                        <span className='absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-muted-foreground bg-background' />
                                        <p className='text-xs font-medium text-muted-foreground'>{t('detail.pendingReview')}</p>
                                    </li>
                                )}
                            </ol>
                        </div>

                        {appeal.evidence_files && appeal.evidence_files.length > 0 && (
                            <div className='rounded-lg border bg-background p-4 space-y-2'>
                                <p className='text-xs uppercase tracking-wide text-muted-foreground font-medium'>
                                    {t('detail.fields.evidence')} ({appeal.evidence_files.length})
                                </p>
                                <div className='flex flex-wrap gap-2'>
                                    {appeal.evidence_files.map((file, i) => (
                                        <a
                                            key={file.id}
                                            href={file.url}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='relative h-16 w-16 rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary transition-all'
                                        >
                                            <Image
                                                src={file.url}
                                                alt={file.file_name || `Evidence ${i + 1}`}
                                                fill
                                                className='object-cover'
                                                unoptimized
                                            />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='space-y-2'>
                        <p className='text-sm font-semibold'>{t('detail.resourceTitle')}</p>
                        <div className='rounded-lg border bg-muted/20 p-4 min-h-[200px]'>
                            {hasPreview ? (
                                <ResourcePreviewBlock preview={appeal.resource_preview!} />
                            ) : (
                                <div className='flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground'>
                                    <FileText className='h-8 w-8' />
                                    <p className='text-sm'>{t('detail.resourceUnavailable')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant='outline' size='sm' onClick={onClose}>
                        {t('detail.close')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
