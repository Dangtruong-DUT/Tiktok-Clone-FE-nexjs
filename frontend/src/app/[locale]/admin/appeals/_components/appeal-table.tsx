'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
    useApproveAppealMutation,
    useGetAdminAppealsQuery,
    useRejectAppealMutation
} from '@/store/services/admin/index'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import AutoPagination from '@/components/auto-pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { AlertCircle, Check, Search, X } from 'lucide-react'
import type { AdminAppeal } from '@/types/dtos/admin/admin-response.dto'
import { formatAdminDate, truncateText } from '@/helpers/admin-helpers'
import {
    APPEAL_REVIEW_ACTIONS,
    APPEAL_STATUS_VALUES,
    APPEAL_STATUSES,
    APPEAL_TYPE_VALUES,
    type AppealReviewAction,
    type AppealStatus,
    type AppealType
} from '@/constants/appeal.const'

const FILTER_ALL = 'all' as const

export function AppealTable() {
    const t = useTranslations('AdminPage')

    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<typeof FILTER_ALL | AppealStatus>(FILTER_ALL)
    const [typeFilter, setTypeFilter] = useState<typeof FILTER_ALL | AppealType>(FILTER_ALL)

    const [selectedAppeal, setSelectedAppeal] = useState<AdminAppeal | null>(null)
    const [actionType, setActionType] = useState<AppealReviewAction | null>(null)
    const [adminResponse, setAdminResponse] = useState('')

    const { data, isLoading, isFetching, refetch } = useGetAdminAppealsQuery({
        page,
        per_page: perPage,
        appeal_status: statusFilter === FILTER_ALL ? undefined : statusFilter,
        appeal_type: typeFilter === FILTER_ALL ? undefined : typeFilter,
        order_by: ['-created_at']
    })

    const [approveAppeal, approveState] = useApproveAppealMutation()
    const [rejectAppeal, rejectState] = useRejectAppealMutation()

    const appeals = (data?.data ?? []).filter((appeal) => {
        if (!searchTerm.trim()) return true

        const keyword = searchTerm.trim().toLowerCase()
        return [
            appeal.user?.username ?? '',
            appeal.reason,
            appeal.appeal_type,
            appeal.resource_type,
            String(appeal.resource_id ?? ''),
            appeal.status
        ]
            .join(' ')
            .toLowerCase()
            .includes(keyword)
    })

    const pagination = data?.meta
    const totalItems = pagination?.total ?? appeals.length
    const isSubmitting = approveState.isLoading || rejectState.isLoading

    const getStatusVariant = (status: string) => {
        if (status === APPEAL_STATUSES.APPROVED) return 'bg-green-100 text-green-800'
        if (status === APPEAL_STATUSES.REJECTED) return 'bg-red-100 text-red-800'
        return 'bg-yellow-100 text-yellow-800'
    }

    const actionSubmitLabel =
        actionType === APPEAL_REVIEW_ACTIONS.APPROVE ? t('appeals.actions.approve') : t('appeals.actions.reject')

    const closeDialog = () => {
        setSelectedAppeal(null)
        setActionType(null)
        setAdminResponse('')
    }

    const handleReviewAppeal = async () => {
        if (!selectedAppeal || !actionType) return

        if (!selectedAppeal.uuid) {
            toast.error(t('appeals.messages.missingAppealUuid'))
            return
        }

        if (actionType === APPEAL_REVIEW_ACTIONS.REJECT && adminResponse.trim().length < 10) {
            toast.error(t('appeals.errors.rejectReasonMin'))
            return
        }

        try {
            if (actionType === APPEAL_REVIEW_ACTIONS.APPROVE) {
                await approveAppeal({
                    appeal_uuid: selectedAppeal.uuid,
                    admin_response: adminResponse.trim() || undefined
                }).unwrap()
                toast.success(t('appeals.messages.approveSuccess'))
            } else {
                await rejectAppeal({
                    appeal_uuid: selectedAppeal.uuid,
                    admin_response: adminResponse.trim()
                }).unwrap()
                toast.success(t('appeals.messages.rejectSuccess'))
            }

            closeDialog()
            refetch()
        } catch (error) {
            const errorMessage = (error as { data?: { message?: string } })?.data?.message
            toast.error(errorMessage || t('appeals.messages.reviewError'))
        }
    }

    if (isLoading) {
        return (
            <div className='space-y-4'>
                <div className='flex gap-2'>
                    <Skeleton className='h-10 flex-1' />
                    <Skeleton className='h-10 w-32' />
                </div>
                <div className='border rounded-lg'>
                    <div className='p-4 space-y-3'>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className='h-16' />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='space-y-4'>
            <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
                <div className='flex-1 relative'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                    <Input
                        placeholder={t('appeals.placeholders.searchAppeals')}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setPage(1)
                        }}
                        className='pl-10'
                    />
                </div>

                <div className='flex gap-2'>
                    <Select
                        value={statusFilter}
                        onValueChange={(value: typeof FILTER_ALL | AppealStatus) => {
                            setStatusFilter(value)
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className='w-40'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={FILTER_ALL}>{t('appeals.filters.allStatuses')}</SelectItem>
                            {APPEAL_STATUS_VALUES.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {t(`appeals.statuses.${status}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={typeFilter}
                        onValueChange={(value: typeof FILTER_ALL | AppealType) => {
                            setTypeFilter(value)
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className='w-48'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={FILTER_ALL}>{t('appeals.filters.allTypes')}</SelectItem>
                            {APPEAL_TYPE_VALUES.map((appealType) => (
                                <SelectItem key={appealType} value={appealType}>
                                    {t(`appeals.types.${appealType}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {appeals.length === 0 ? (
                <div className='border rounded-lg p-8 text-center'>
                    <AlertCircle className='w-12 h-12 text-muted-foreground mx-auto mb-3' />
                    <p className='text-muted-foreground'>{t('appeals.emptyState')}</p>
                </div>
            ) : (
                <div className='border rounded-lg overflow-hidden'>
                    <Table>
                        <TableHeader>
                            <TableRow className='bg-muted/50'>
                                <TableHead>{t('appeals.columns.id')}</TableHead>
                                <TableHead>{t('appeals.columns.user')}</TableHead>
                                <TableHead>{t('appeals.columns.type')}</TableHead>
                                <TableHead>{t('appeals.columns.reason')}</TableHead>
                                <TableHead>{t('appeals.columns.status')}</TableHead>
                                <TableHead>{t('appeals.columns.createdAt')}</TableHead>
                                <TableHead className='text-right'>{t('appeals.columns.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appeals.map((appeal) => (
                                <TableRow key={appeal.id} className='hover:bg-muted/50'>
                                    <TableCell className='font-mono text-sm'>#{appeal.id}</TableCell>
                                    <TableCell>{appeal.user?.username ?? 'N/A'}</TableCell>
                                    <TableCell>{t(`appeals.types.${appeal.appeal_type}`)}</TableCell>
                                    <TableCell className='max-w-sm'>{truncateText(appeal.reason, 60)}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusVariant(appeal.status)}>
                                            {t(`appeals.statuses.${appeal.status}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{formatAdminDate(appeal.created_at)}</TableCell>
                                    <TableCell className='text-right'>
                                        {appeal.status === APPEAL_STATUSES.PENDING ? (
                                            <div className='flex justify-end gap-2'>
                                                <Button
                                                    size='sm'
                                                    variant='outline'
                                                    disabled={isFetching}
                                                    onClick={() => {
                                                        setSelectedAppeal(appeal)
                                                        setActionType(APPEAL_REVIEW_ACTIONS.APPROVE)
                                                    }}
                                                >
                                                    <Check className='w-4 h-4 mr-1' />
                                                    {t('appeals.actions.approve')}
                                                </Button>
                                                <Button
                                                    size='sm'
                                                    variant='destructive'
                                                    disabled={isFetching}
                                                    onClick={() => {
                                                        setSelectedAppeal(appeal)
                                                        setActionType(APPEAL_REVIEW_ACTIONS.REJECT)
                                                    }}
                                                >
                                                    <X className='w-4 h-4 mr-1' />
                                                    {t('appeals.actions.reject')}
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className='text-muted-foreground text-sm'>-</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {pagination && (
                <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                    <div className='flex items-center gap-2'>
                        <span className='text-sm text-muted-foreground'>{t('common.perPage')}</span>
                        <Select
                            value={String(perPage)}
                            onValueChange={(value) => {
                                setPerPage(Number(value))
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className='w-20'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='5'>5</SelectItem>
                                <SelectItem value='10'>10</SelectItem>
                                <SelectItem value='25'>25</SelectItem>
                                <SelectItem value='50'>50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='text-sm text-muted-foreground'>
                        {t('common.showingResults', {
                            from: (pagination.current_page - 1) * perPage + 1,
                            to: Math.min(pagination.current_page * perPage, totalItems),
                            total: totalItems
                        })}
                    </div>

                    {pagination.last_page > 1 && (
                        <AutoPagination page={page} pageSize={pagination.last_page} onPageChange={setPage} />
                    )}
                </div>
            )}

            <Dialog open={!!selectedAppeal && !!actionType} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent className='sm:max-w-[520px]'>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === APPEAL_REVIEW_ACTIONS.APPROVE
                                ? t('appeals.actions.approve')
                                : t('appeals.actions.reject')}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === APPEAL_REVIEW_ACTIONS.APPROVE
                                ? t('appeals.dialogs.approve')
                                : t('appeals.dialogs.reject')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-2 py-2'>
                        <Label htmlFor='admin-response'>{t('appeals.labels.adminResponse')}</Label>
                        <Textarea
                            id='admin-response'
                            value={adminResponse}
                            onChange={(event) => setAdminResponse(event.target.value)}
                            placeholder={
                                actionType === APPEAL_REVIEW_ACTIONS.APPROVE
                                    ? t('appeals.placeholders.approveResponse')
                                    : t('appeals.placeholders.rejectResponse')
                            }
                            className='min-h-[100px]'
                        />
                    </div>

                    <DialogFooter>
                        <Button variant='outline' onClick={closeDialog} disabled={isSubmitting}>
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant={actionType === APPEAL_REVIEW_ACTIONS.APPROVE ? 'default' : 'destructive'}
                            onClick={handleReviewAppeal}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? t('common.loading') : actionSubmitLabel}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
