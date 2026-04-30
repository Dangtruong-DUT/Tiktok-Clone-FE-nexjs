'use client'

import { useState, useCallback, useMemo } from 'react'
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
import {
    AlertCircle,
    Check,
    Search,
    X,
    ImageIcon,
    ChevronDown,
    ChevronUp,
    Clock,
    CheckCircle2,
    XCircle
} from 'lucide-react'
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
import { EvidenceGalleryDialog } from './evidence-gallery-dialog'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const FILTER_ALL = 'all' as const

const STATUS_CONFIG = {
    [APPEAL_STATUSES.PENDING]: {
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: Clock,
        label: 'pending'
    },
    [APPEAL_STATUSES.APPROVED]: {
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
        label: 'approved'
    },
    [APPEAL_STATUSES.REJECTED]: {
        className: 'bg-red-50 text-red-700 border-red-200',
        icon: XCircle,
        label: 'rejected'
    }
} as const

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

    const [expandedRowId, setExpandedRowId] = useState<number | null>(null)
    const [galleryAppeal, setGalleryAppeal] = useState<AdminAppeal | null>(null)

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
                appeal.reason,
                appeal.appeal_type,
                appeal.resource_type,
                String(appeal.resource_id ?? ''),
                appeal.status
            ]
                .join(' ')
                .toLowerCase()
                .includes(keyword)
        )
    }, [data?.data, searchTerm])

    const pagination = data?.meta
    const totalItems = pagination?.total ?? appeals.length
    const isSubmitting = approveState.isLoading || rejectState.isLoading

    const getStatusConfig = useCallback((status: string) => {
        return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG[APPEAL_STATUSES.PENDING]
    }, [])

    const actionSubmitLabel =
        actionType === APPEAL_REVIEW_ACTIONS.APPROVE ? t('appeals.actions.approve') : t('appeals.actions.reject')

    const closeDialog = useCallback(() => {
        setSelectedAppeal(null)
        setActionType(null)
        setAdminResponse('')
    }, [])

    const toggleExpandRow = useCallback((id: number) => {
        setExpandedRowId((prev) => (prev === id ? null : id))
    }, [])

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
            const errorMessage = (error as { data?: { message?: string } })?.data?.message
            toast.error(errorMessage || t('appeals.messages.reviewError'))
        }
    }, [selectedAppeal, actionType, adminResponse, approveAppeal, rejectAppeal, closeDialog, refetch, t])

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
            {/* Filters */}
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
                        <SelectTrigger className='w-48'>
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

            {/* Table */}
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
                                <TableHead className='w-[50px]'></TableHead>
                                <TableHead>{t('appeals.columns.id')}</TableHead>
                                <TableHead>{t('appeals.columns.user')}</TableHead>
                                <TableHead>{t('appeals.columns.type')}</TableHead>
                                <TableHead>{t('appeals.columns.reason')}</TableHead>
                                <TableHead>{t('appeals.columns.evidence')}</TableHead>
                                <TableHead>{t('appeals.columns.status')}</TableHead>
                                <TableHead>{t('appeals.columns.createdAt')}</TableHead>
                                <TableHead className='text-right'>{t('appeals.columns.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appeals.map((appeal) => {
                                const statusConf = getStatusConfig(appeal.status)
                                const StatusIcon = statusConf.icon
                                const hasEvidence =
                                    appeal.evidence_files && appeal.evidence_files.length > 0
                                const isExpanded = expandedRowId === appeal.id

                                return (
                                    <>
                                        <TableRow
                                            key={appeal.id}
                                            className='hover:bg-muted/50 transition-colors cursor-pointer'
                                            onClick={() => toggleExpandRow(appeal.id)}
                                        >
                                            <TableCell>
                                                <button className='p-1 hover:bg-muted rounded'>
                                                    {isExpanded ? (
                                                        <ChevronUp className='h-4 w-4 text-muted-foreground' />
                                                    ) : (
                                                        <ChevronDown className='h-4 w-4 text-muted-foreground' />
                                                    )}
                                                </button>
                                            </TableCell>
                                            <TableCell className='font-mono text-sm'>#{appeal.id}</TableCell>
                                            <TableCell>
                                                <div className='flex items-center gap-2'>
                                                    {appeal.user?.avatar && (
                                                        <Image
                                                            src={appeal.user.avatar}
                                                            alt={appeal.user.username}
                                                            width={24}
                                                            height={24}
                                                            className='rounded-full'
                                                            unoptimized
                                                        />
                                                    )}
                                                    <span className='text-sm font-medium'>
                                                        {appeal.user?.username ?? 'N/A'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className='text-sm'>
                                                    {t(`appeals.types.${appeal.appeal_type}`)}
                                                </span>
                                            </TableCell>
                                            <TableCell className='max-w-[200px]'>
                                                <span className='text-sm text-muted-foreground'>
                                                    {truncateText(appeal.reason ?? '', 50)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {hasEvidence ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setGalleryAppeal(appeal)
                                                        }}
                                                        className='flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors'
                                                    >
                                                        <ImageIcon className='h-4 w-4' />
                                                        <span>{appeal.evidence_files!.length}</span>
                                                    </button>
                                                ) : (
                                                    <span className='text-muted-foreground text-sm'>—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant='outline'
                                                    className={`${statusConf.className} gap-1 border`}
                                                >
                                                    <StatusIcon className='h-3 w-3' />
                                                    {t(`appeals.statuses.${statusConf.label}`)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className='text-sm'>
                                                {formatAdminDate(appeal.created_at)}
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                {appeal.status === APPEAL_STATUSES.PENDING ? (
                                                    <div
                                                        className='flex justify-end gap-2'
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Button
                                                            size='sm'
                                                            variant='outline'
                                                            disabled={isFetching}
                                                            className='h-8'
                                                            onClick={() => {
                                                                setSelectedAppeal(appeal)
                                                                setActionType(APPEAL_REVIEW_ACTIONS.APPROVE)
                                                            }}
                                                        >
                                                            <Check className='w-3.5 h-3.5 mr-1' />
                                                            {t('appeals.actions.approve')}
                                                        </Button>
                                                        <Button
                                                            size='sm'
                                                            variant='destructive'
                                                            disabled={isFetching}
                                                            className='h-8'
                                                            onClick={() => {
                                                                setSelectedAppeal(appeal)
                                                                setActionType(APPEAL_REVIEW_ACTIONS.REJECT)
                                                            }}
                                                        >
                                                            <X className='w-3.5 h-3.5 mr-1' />
                                                            {t('appeals.actions.reject')}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className='text-muted-foreground text-sm'>—</span>
                                                )}
                                            </TableCell>
                                        </TableRow>

                                        {/* Expandable row */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <TableRow key={`${appeal.id}-expanded`}>
                                                    <TableCell colSpan={9} className='p-0 border-0'>
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className='overflow-hidden'
                                                        >
                                                            <div className='bg-muted/30 px-6 py-4 space-y-3'>
                                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                                    <div>
                                                                        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1'>
                                                                            {t('appeals.columns.reason')}
                                                                        </p>
                                                                        <p className='text-sm whitespace-pre-wrap'>
                                                                            {appeal.reason || '—'}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1'>
                                                                            {t('appeals.labels.adminResponse')}
                                                                        </p>
                                                                        <p className='text-sm whitespace-pre-wrap'>
                                                                            {appeal.admin_response || '—'}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Evidence thumbnails */}
                                                                {hasEvidence && (
                                                                    <div>
                                                                        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2'>
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
                                                                                        className='relative h-16 w-16 rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-primary transition-all'
                                                                                        title={file.file_name}
                                                                                    >
                                                                                        <Image
                                                                                            src={file.url}
                                                                                            alt={file.file_name || `Evidence ${index + 1}`}
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

                                                                {/* Metadata */}
                                                                <div className='flex gap-6 text-xs text-muted-foreground'>
                                                                    <span>
                                                                        Resource: {appeal.resource_type} #
                                                                        {appeal.resource_id ?? '—'}
                                                                    </span>
                                                                    {appeal.reviewed_at && (
                                                                        <span>
                                                                            Reviewed:{' '}
                                                                            {formatAdminDate(appeal.reviewed_at)}
                                                                        </span>
                                                                    )}
                                                                    {appeal.reviewer && (
                                                                        <span>
                                                                            By: {appeal.reviewer.username}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </AnimatePresence>
                                    </>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Pagination */}
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

            {/* Review dialog */}
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

            {/* Evidence gallery dialog */}
            <EvidenceGalleryDialog
                open={!!galleryAppeal}
                onOpenChange={(open) => !open && setGalleryAppeal(null)}
                evidenceFiles={galleryAppeal?.evidence_files ?? []}
                appealId={galleryAppeal?.id}
            />
        </div>
    )
}
