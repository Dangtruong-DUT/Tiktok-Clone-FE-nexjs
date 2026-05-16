'use client'

import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatAdminDate, getActivityKey, truncateText } from '@/helpers/admin-helpers'
import type { AdminActivityListItem } from '@/types/dtos/admin/admin-response.dto'

interface ActivityLogDetailDialogProps {
    open: boolean
    log: AdminActivityListItem
    onOpenChange: (open: boolean) => void
}

export function ActivityLogDetailDialog({ open, log, onOpenChange }: ActivityLogDetailDialogProps) {
    const t = useTranslations('AdminPage')

    const actor = 'action_type' in log ? log.user?.username : log.admin?.username
    const actionKey = getActivityKey({
        action: 'action' in log ? log.action : undefined,
        action_type: 'action_type' in log ? log.action_type : undefined
    })
    const actionLabel = t(`actionLabels.${actionKey}` as Parameters<typeof t>[0]) ?? actionKey
    const metadata = 'metadata' in log ? log.metadata : null

    const metadataEntries = metadata
        ? Object.entries(metadata).filter(([key, value]) => key && value !== undefined && value !== null)
        : []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[720px]'>
                <DialogHeader>
                    <DialogTitle>{t('activity.detail.title')}</DialogTitle>
                </DialogHeader>

                <div className='space-y-4 text-sm'>
                    <div className='grid grid-cols-1 gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2'>
                        <DetailItem label={t('activity.detail.fields.action')} value={actionLabel} />
                        <DetailItem label={t('activity.detail.fields.actor')} value={actor || '—'} />
                        <DetailItem label={t('activity.detail.fields.resourceType')} value={log.resource_type || '—'} />
                        <DetailItem
                            label={t('activity.detail.fields.resourceId')}
                            value={log.resource_id ? `#${log.resource_id}` : '—'}
                        />
                        <DetailItem
                            label={t('activity.detail.fields.timestamp')}
                            value={formatAdminDate(log.created_at)}
                        />
                        <DetailItem
                            label={t('activity.detail.fields.reason')}
                            value={'reason' in log ? log.reason || '—' : '—'}
                        />
                    </div>

                    <div className='rounded-lg border bg-background p-4'>
                        <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                            {t('activity.detail.fields.metadata')}
                        </p>
                        {metadataEntries.length === 0 ? (
                            <p className='mt-2 text-sm text-muted-foreground'>—</p>
                        ) : (
                            <div className='mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2'>
                                {metadataEntries.map(([key, value]) => (
                                    <div key={key} className='flex flex-col'>
                                        <span className='text-xs uppercase tracking-wide text-muted-foreground'>
                                            {key}
                                        </span>
                                        <span className='mt-1 font-medium text-foreground'>
                                            {typeof value === 'string'
                                                ? truncateText(value, 120)
                                                : JSON.stringify(value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className='gap-2'>
                    <Button variant='outline' onClick={() => onOpenChange(false)}>
                        {t('common.cancel')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>{label}</p>
            <p className='mt-1 font-medium'>{value}</p>
        </div>
    )
}
