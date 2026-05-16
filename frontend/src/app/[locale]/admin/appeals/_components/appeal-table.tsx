'use client'

import { Fragment, useState, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useApproveAppealMutation, useGetAdminAppealsQuery, useRejectAppealMutation } from '@/store/services/admin'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { extractApiError } from '@/utils/extract-api-error'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminTableToolbar } from '@/components/admin'
import { TablePanel } from '@/components/table-panel'
import { TablePagination } from '@/components/table-pagination'
import { TableSkeleton } from '@/components/table-skeleton'
import { EmptyState } from '@/components/empty-state'
import { EvidenceGalleryDialog } from './evidence-gallery-dialog'
import { AppealDetailDialog } from './appeal-detail-dialog'
import { formatAdminDate } from '@/helpers/admin-helpers'
import { TABLE_HEAD_CLASS } from '@/constants/ui/admin'
import type { AdminAppeal } from '@/types/dtos/admin/admin-response.dto'
import {
    APPEAL_REVIEW_ACTIONS,
    APPEAL_STATUS_VALUES,
    APPEAL_STATUSES,
    APPEAL_TYPE_VALUES,
    type AppealReviewAction,
    type AppealStatus,
    type AppealType
} from '@/constants/status/appeal'

const FILTER_ALL = 'all' as const

const STATUS_CONFIG: Record<string, { className: string; labelKey: string }> = {
    [APPEAL_STATUSES.PENDING]: {
        className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
        labelKey: 'pending'
    },
    [APPEAL_STATUSES.APPROVED]: {
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
        labelKey: 'approved'
    },
    [APPEAL_STATUSES.REJECTED]: {
        className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300',
        labelKey: 'rejected'
    }
}

export function AppealTable() {
    const t = useTranslations('AdminPage')

    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<typeof FILTER_ALL | AppealStatus>(FILTER_ALL)
    const [typeFilter, setTypeFilter] = useState<typeof FILTER_ALL | AppealType>(FILTER_ALL)
    const [draftStatus, setDraftStatus] = useState<typeof FILTER_ALL | AppealStatus>(FILTER_ALL)
    const [draftType, setDraftType] = useState<typeof FILTER_ALL | AppealType>(FILTER_ALL)
    const [selectedAppeal, setSelectedAppeal] = useState<AdminAppeal | null>(null)
    const [actionType, setActionType] = useState<AppealReviewAction | null>(null)
    const [adminResponse, setAdminResponse] = useState('')
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
    const [galleryAppeal, setGalleryAppeal] = useState<AdminAppeal | null>(null)
    const [detailAppeal, setDetailAppeal] = useState<AdminAppeal | null>(null)

    const { data, isLoading, isFetching, refetch } = useGetAdminAppealsQuery({
        page,
        per_page: perPage,
        appeal_status: statusFilter === FILTER_ALL ? undefined : statusFilter,
        appeal_type: typeFilter === FILTER_ALL ? undefined : typeFilter,
        order_by: ['-created_at']
    })

    const [approveAppeal, approveState] = useApproveAppealMutation()
    const [rejectAppeal, rejectState] = useRejectAppealMutation()

    const appeals = useMemo(() => {
        const list = data?.data ?? []
        if (!searchTerm.trim()) return list
        const keyword = searchTerm.trim().toLowerCase()
        return list.filter((appeal) =>
            [
                appeal.user?.username ?? '',
                appeal.reason ?? '',
                appeal.appeal_type,
                appeal.resource_type ?? '',
                appeal.status
            ]
                .join(' ')
                .toLowerCase()
                .includes(keyword)
        )
    }, [data?.data, searchTerm])

    const pagination = data?.meta
    const isSubmitting = approveState.isLoading || rejectState.isLoading
    const hasActiveFilters = statusFilter !== FILTER_ALL || typeFilter !== FILTER_ALL

    const getStatusConfig = useCallback((status: string) => {
        return STATUS_CONFIG[status] ?? STATUS_CONFIG[APPEAL_STATUSES.PENDING]!
    }, [])

    const closeDialog = useCallback(() => {
        setSelectedAppeal(null)
        setActionType(null)
        setAdminResponse('')
    }, [])

    const toggleExpandRow = useCallback((id: string) => {
        setExpandedRowId((prev) => (prev === id ? null : id))
    }, [])

    const handleResetFilters = () => {
        setDraftStatus(FILTER_ALL)
        setDraftType(FILTER_ALL)
        setStatusFilter(FILTER_ALL)
        setTypeFilter(FILTER_ALL)
        setPage(1)
    }

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        setStatusFilter(draftStatus)
        setTypeFilter(draftType)
        setPage(1)
    }

    const handlePerPageChange = (n: number) => {
        setPerPage(n)
        setPage(1)
    }

    const handleReviewAppeal = useCallback(async () => {
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
            toast.error(extractApiError(error) ?? t('appeals.messages.reviewError'))
        }
    }, [selectedAppeal, actionType, adminResponse, approveAppeal, rejectAppeal, closeDialog, refetch, t])

    if (isLoading) {
        return (
            <TableSkeleton
                columnWidths={[
                    'w-4 shrink-0',
                    'w-8 shrink-0',
                    'w-24',
                    'w-28',
                    'flex-1',
                    'w-12',
                    'w-20 rounded-full',
                    'w-24',
                    'w-20 ml-auto'
                ]}
            />
        )
    }

    return (
        <TooltipProvider>
            <div className='space-y-2'>
                <TablePanel
                    isFetching={isFetching}
                    toolbar={
                        <AdminTableToolbar
                            searchValue={searchTerm}
                            onSearchChange={handleSearch}
                            searchPlaceholder={t('appeals.placeholders.searchAppeals')}
                            hasActiveFilters={hasActiveFilters}
                            onResetFilters={handleResetFilters}
                            resetLabel={t('common.reset')}
                            isFetching={isFetching}
                            filters={
                                <>
                                    <Select
                                        value={draftStatus}
                                        onValueChange={(v) => setDraftStatus(v as typeof FILTER_ALL | AppealStatus)}
                                    >
                                        <SelectTrigger className='h-7 w-40 rounded text-xs'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL}>
                                                {t('appeals.filters.allStatuses')}
                                            </SelectItem>
                                            {APPEAL_STATUS_VALUES.map((status) => (
                                                <SelectItem key={status} value={status}>
                                                    {t(`appeals.statuses.${status}` as Parameters<typeof t>[0])}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={draftType}
                                        onValueChange={(v) => setDraftType(v as typeof FILTER_ALL | AppealType)}
                                    >
                                        <SelectTrigger className='h-7 w-40 rounded text-xs'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={FILTER_ALL}>{t('appeals.filters.allTypes')}</SelectItem>
                                            {APPEAL_TYPE_VALUES.map((appealType) => (
                                                <SelectItem key={appealType} value={appealType}>
                                                    {t(`appeals.types.${appealType}` as Parameters<typeof t>[0])}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </>
                            }
                        />
                    }
                    pagination={
                        pagination ? (
                            <TablePagination
                                pagination={pagination}
                                page={page}
                                perPage={perPage}
                                onPageChange={setPage}
                                onPerPageChange={handlePerPageChange}
                                perPageLabel={t('common.perPage')}
                                showingResultsFormatter={(from, to, total) =>
                                    t('common.showingResults', { from, to, total })
                                }
                            />
                        ) : undefined
                    }
                >
                    {appeals.length === 0 ? (
                        <EmptyState message={t('appeals.emptyState')} />
                    ) : (
                        <div>
                            <Table>
                                <TableHeader>
                                    <TableRow className='hover:bg-muted/40'>
                                        <TableHead className='w-10' />
                                        <TableHead className={`${TABLE_HEAD_CLASS} w-16`}>
                                            {t('appeals.columns.id')}
                                        </TableHead>
                                        <TableHead className={TABLE_HEAD_CLASS}>{t('appeals.columns.user')}</TableHead>
                                        <TableHead className={TABLE_HEAD_CLASS}>{t('appeals.columns.type')}</TableHead>
                                        <TableHead className={TABLE_HEAD_CLASS}>
                                            {t('appeals.columns.reason')}
                                        </TableHead>
                                        <TableHead className={`${TABLE_HEAD_CLASS} w-20`}>
                                            {t('appeals.columns.evidence')}
                                        </TableHead>
                                        <TableHead className={`${TABLE_HEAD_CLASS} w-28`}>
                                            {t('appeals.columns.status')}
                                        </TableHead>
                                        <TableHead className={TABLE_HEAD_CLASS}>
                                            {t('appeals.columns.createdAt')}
                                        </TableHead>
                                        <TableHead className={`text-right ${TABLE_HEAD_CLASS}`}>
                                            {t('appeals.columns.actions')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {appeals.map((appeal) => {
                                        const statusConf = getStatusConfig(appeal.status)
                                        const hasEvidence = (appeal.evidence_files?.length ?? 0) > 0
                                        const isExpanded =
                                            expandedRowId !== null &&
                                            expandedRowId === (appeal.uuid ?? String(appeal.id))

                                        return (
                                            <Fragment key={appeal.uuid ?? appeal.id}>
                                                <TableRow
                                                    className='hover:bg-muted/40 cursor-pointer transition-colors'
                                                    onClick={() => toggleExpandRow(appeal.uuid ?? String(appeal.id))}
                                                >
                                                    <TableCell>
                                                        <span className='text-xs text-muted-foreground select-none'>
                                                            {isExpanded ? '▲' : '▼'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className='font-mono text-xs text-muted-foreground'>
                                                        #{appeal.id}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className='flex items-center gap-2'>
                                                            {appeal.user?.avatar && (
                                                                <Image
                                                                    src={appeal.user.avatar}
                                                                    alt={appeal.user.username}
                                                                    width={24}
                                                                    height={24}
                                                                    className='rounded-full object-cover'
                                                                    unoptimized
                                                                />
                                                            )}
                                                            <span className='text-sm font-medium'>
                                                                {appeal.user?.username ?? '—'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className='text-sm'>
                                                        {t(
                                                            `appeals.types.${appeal.appeal_type}` as Parameters<
                                                                typeof t
                                                            >[0]
                                                        )}
                                                    </TableCell>
                                                    <TableCell className='max-w-[200px]'>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className='line-clamp-1 cursor-help text-sm text-muted-foreground'>
                                                                    {appeal.reason ?? '—'}
                                                                </span>
                                                            </TooltipTrigger>
                                                            {appeal.reason && (
                                                                <TooltipContent side='top' className='max-w-xs'>
                                                                    <p className='text-xs'>{appeal.reason}</p>
                                                                </TooltipContent>
                                                            )}
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell>
                                                        {hasEvidence ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setGalleryAppeal(appeal)
                                                                }}
                                                                className='text-sm font-medium text-primary hover:underline'
                                                            >
                                                                {appeal.evidence_files!.length}
                                                            </button>
                                                        ) : (
                                                            <span className='text-muted-foreground text-sm'>—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant='outline' className={statusConf.className}>
                                                            {t(
                                                                `appeals.statuses.${statusConf.labelKey}` as Parameters<
                                                                    typeof t
                                                                >[0]
                                                            )}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className='text-sm text-muted-foreground'>
                                                        {formatAdminDate(appeal.created_at)}
                                                    </TableCell>
                                                    <TableCell className='text-right'>
                                                        {appeal.status === APPEAL_STATUSES.PENDING ? (
                                                            <div
                                                                className='flex flex-wrap justify-end gap-1.5'
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Button
                                                                    size='sm'
                                                                    variant='ghost'
                                                                    className='h-7 text-xs'
                                                                    onClick={() => setDetailAppeal(appeal)}
                                                                >
                                                                    {t('appeals.actions.viewDetails')}
                                                                </Button>
                                                                <Button
                                                                    size='sm'
                                                                    variant='outline'
                                                                    disabled={isFetching}
                                                                    className='h-7 text-xs'
                                                                    onClick={() => {
                                                                        setSelectedAppeal(appeal)
                                                                        setActionType(APPEAL_REVIEW_ACTIONS.APPROVE)
                                                                    }}
                                                                >
                                                                    {t('appeals.actions.approve')}
                                                                </Button>
                                                                <Button
                                                                    size='sm'
                                                                    variant='destructive'
                                                                    disabled={isFetching}
                                                                    className='h-7 text-xs'
                                                                    onClick={() => {
                                                                        setSelectedAppeal(appeal)
                                                                        setActionType(APPEAL_REVIEW_ACTIONS.REJECT)
                                                                    }}
                                                                >
                                                                    {t('appeals.actions.reject')}
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className='flex justify-end'
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Button
                                                                    size='sm'
                                                                    variant='ghost'
                                                                    className='h-7 text-xs'
                                                                    onClick={() => setDetailAppeal(appeal)}
                                                                >
                                                                    {t('appeals.actions.viewDetails')}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>

                                                {/* Expandable row */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <TableRow key={`${appeal.uuid ?? appeal.id}-expanded`}>
                                                            <TableCell colSpan={9} className='p-0 border-0'>
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.18 }}
                                                                    className='overflow-hidden'
                                                                >
                                                                    <div className='bg-muted/30 px-6 py-4 space-y-3'>
                                                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                                                                            <div>
                                                                                <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1'>
                                                                                    {t('appeals.columns.reason')}
                                                                                </p>
                                                                                <p className='whitespace-pre-wrap'>
                                                                                    {appeal.reason ?? '—'}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1'>
                                                                                    {t('appeals.labels.adminResponse')}
                                                                                </p>
                                                                                <p className='whitespace-pre-wrap'>
                                                                                    {appeal.admin_response ?? '—'}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        {hasEvidence && (
                                                                            <div>
                                                                                <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2'>
                                                                                    {t('appeals.columns.evidence')} (
                                                                                    {appeal.evidence_files!.length})
                                                                                </p>
                                                                                <div className='flex gap-2 flex-wrap'>
                                                                                    {appeal.evidence_files!.map(
                                                                                        (file, index) => (
                                                                                            <button
                                                                                                key={file.id}
                                                                                                onClick={() =>
                                                                                                    setGalleryAppeal(
                                                                                                        appeal
                                                                                                    )
                                                                                                }
                                                                                                className='relative h-16 w-16 rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary transition-all'
                                                                                                title={file.file_name}
                                                                                            >
                                                                                                <Image
                                                                                                    src={file.url}
                                                                                                    alt={
                                                                                                        file.file_name ||
                                                                                                        `${t('appeals.evidenceDialog.imageAlt').replace('{index}', String(index + 1))}`
                                                                                                    }
                                                                                                    fill
                                                                                                    className='object-cover'
                                                                                                    unoptimized
                                                                                                />
                                                                                            </button>
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        <div className='flex flex-wrap gap-4 text-xs text-muted-foreground'>
                                                                            <span>
                                                                                {t(
                                                                                    'appeals.detail.fields.resourceType'
                                                                                )}
                                                                                : {appeal.resource_type}
                                                                            </span>
                                                                            {appeal.reviewed_at && (
                                                                                <span>
                                                                                    {t(
                                                                                        'appeals.detail.fields.reviewedAt'
                                                                                    )}
                                                                                    :{' '}
                                                                                    {formatAdminDate(
                                                                                        appeal.reviewed_at
                                                                                    )}
                                                                                </span>
                                                                            )}
                                                                            {appeal.reviewer && (
                                                                                <span>
                                                                                    {t(
                                                                                        'appeals.detail.fields.reviewer'
                                                                                    )}
                                                                                    : {appeal.reviewer.username}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </AnimatePresence>
                                            </Fragment>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TablePanel>

                {/* Review dialog */}
                <Dialog open={selectedAppeal !== null && actionType !== null} onOpenChange={(open) => !open && closeDialog()}>
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
                                onChange={(e) => setAdminResponse(e.target.value)}
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
                                {isSubmitting
                                    ? t('common.loading')
                                    : actionType === APPEAL_REVIEW_ACTIONS.APPROVE
                                      ? t('appeals.actions.approve')
                                      : t('appeals.actions.reject')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <EvidenceGalleryDialog
                    open={galleryAppeal !== null}
                    onOpenChange={(open) => !open && setGalleryAppeal(null)}
                    evidenceFiles={galleryAppeal?.evidence_files ?? []}
                    appealId={galleryAppeal?.uuid ?? undefined}
                />

                {detailAppeal && (
                    <AppealDetailDialog
                        open={detailAppeal !== null}
                        appeal={detailAppeal}
                        onOpenChange={(open) => !open && setDetailAppeal(null)}
                    />
                )}
            </div>
        </TooltipProvider>
    )
}
